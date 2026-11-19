import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import Conversation, { MAX_MESSAGE_LENGTH } from "../models/Conversation.js";
import messageRoutes from "../routes/messageRoutes.js";
import { cleanMessageText } from "../controllers/messageController.js";

// Real HTTP + routes + company token check; database model methods are replaced by an in-memory store.
test("job seeker and recruiter messaging", async (t) => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-only-jwt-secret";
  const originals = [];
  const stub = (obj, key, fn) => { originals.push([obj, key, obj[key]]); obj[key] = fn; };

  const companyA = "507f1f77bcf86cd799439011", companyB = "507f1f77bcf86cd799439099";
  const jobA = "507f1f77bcf86cd799439013", missingJob = "507f1f77bcf86cd799439014";
  const store = [];
  let nextId = 1;
  const query = (value) => {
    const q = { populate: () => q, sort: () => q, lean: async () => value, then: (r, j) => Promise.resolve(value).then(r, j) };
    return q;
  };
  const matches = (doc, filter) => Object.entries(filter).every(([k, v]) => String(doc[k]) === String(v));

  stub(User, "findById", async (id) => ({ _id: id, name: "Test Seeker", email: `${id}@example.test` }));
  stub(Company, "findById", (id) => ({ select: async () => ([companyA, companyB].includes(String(id)) ? { _id: String(id) } : null) }));
  stub(Job, "findById", (id) => ({ select: () => ({ lean: async () => (String(id) === jobA ? { _id: jobA, companyId: companyA } : null) }) }));
  stub(Conversation, "find", (filter) => query(store.filter((d) => matches(d, filter))));
  // No applications in this test, so no welcome chats are started.
  stub(JobApplication, "find", () => query([]));
  stub(JobApplication, "findOne", () => query(null));
  stub(Conversation, "findOneAndUpdate", (filter, update, options = {}) => {
    let doc = store.find((d) => matches(d, filter));
    if (!doc && options.upsert) {
      doc = { _id: `c${nextId++}`, messages: [], userUnread: 0, companyUnread: 0, ...update.$setOnInsert };
      store.push(doc);
    }
    if (doc) {
      if (update.$push) doc.messages.push({ ...update.$push.messages, createdAt: new Date() });
      Object.assign(doc, update.$set || {});
      for (const [k, v] of Object.entries(update.$inc || {})) doc[k] += v;
    }
    return query(doc ? structuredClone(doc) : null);
  });

  const app = express();
  app.use(express.json());
  // Stand-in for Clerk: the test sets the signed-in job seeker with a header.
  app.use((req, _res, next) => { if (req.headers["x-test-user"]) req.auth = { userId: req.headers["x-test-user"] }; next(); });
  app.use("/api/messages", messageRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}/api/messages`;
  const tokenA = jwt.sign({ id: companyA }, process.env.JWT_SECRET);
  const tokenB = jwt.sign({ id: companyB }, process.env.JWT_SECRET);
  const call = async (path, { method = "GET", body, headers = {} } = {}) => {
    const res = await fetch(base + path, { method, headers: { "content-type": "application/json", ...headers }, body: body && JSON.stringify(body) });
    return { status: res.status, data: await res.json() };
  };

  t.after(async () => {
    await new Promise((r) => server.close(r));
    for (const [obj, key, value] of originals.reverse()) obj[key] = value;
    process.env.JWT_SECRET = originalSecret;
  });

  // Validation helper
  assert.equal(cleanMessageText("  hi  "), "hi");
  assert.equal(cleanMessageText("   "), null);
  assert.equal(cleanMessageText(123), null);
  assert.equal(cleanMessageText("x".repeat(MAX_MESSAGE_LENGTH + 1)), null);

  // Must be signed in
  let r = await call("/user/send", { method: "POST", body: { jobId: jobA, text: "Hi" } });
  assert.equal(r.status, 401);

  const seeker = { "x-test-user": "user_1" };
  r = await call("/user/send", { method: "POST", headers: seeker, body: { jobId: jobA, text: "   " } });
  assert.equal(r.status, 400, "empty message rejected");
  r = await call("/user/send", { method: "POST", headers: seeker, body: { jobId: missingJob, text: "Hi" } });
  assert.equal(r.status, 404, "unknown job rejected");

  // Job seeker starts a conversation; company comes from the job, not the browser
  r = await call("/user/send", { method: "POST", headers: seeker, body: { jobId: jobA, text: "Is this role still open?", companyId: companyB } });
  assert.equal(r.status, 200);
  assert.equal(String(r.data.conversation.companyId), companyA);
  assert.equal(r.data.conversation.companyUnread, 1);
  const conversationId = r.data.conversation._id;

  // A second message reuses the same conversation
  r = await call("/user/send", { method: "POST", headers: seeker, body: { jobId: jobA, text: "Any update to the post?" } });
  assert.equal(r.data.conversation._id, conversationId);
  assert.equal(r.data.conversation.messages.length, 2);
  assert.equal(store.length, 1);

  // Recruiter must be logged in, and only sees their own company's conversations
  r = await call("/company/conversations");
  assert.equal(r.status, 401);
  r = await call("/company/conversations", { headers: { token: tokenA } });
  assert.equal(r.data.conversations.length, 1);
  assert.equal(r.data.conversations[0].unread, 2);
  assert.equal(r.data.conversations[0].lastMessage.text, "Any update to the post?");
  r = await call("/company/conversations", { headers: { token: tokenB } });
  assert.equal(r.data.conversations.length, 0, "other company sees nothing");
  r = await call(`/company/conversations/${conversationId}`, { headers: { token: tokenB } });
  assert.equal(r.status, 400, "non-ObjectId id rejected before lookup");

  // Opening as the right company marks it read; replying notifies the seeker
  store[0]._id = "507f1f77bcf86cd7994390aa";
  r = await call(`/company/conversations/${store[0]._id}`, { headers: { token: tokenB } });
  assert.equal(r.status, 404, "other company cannot open it");
  r = await call(`/company/conversations/${store[0]._id}/reply`, { method: "POST", headers: { token: tokenB }, body: { text: "Hi" } });
  assert.equal(r.status, 404, "other company cannot reply");
  r = await call(`/company/conversations/${store[0]._id}`, { headers: { token: tokenA } });
  assert.equal(r.status, 200);
  assert.equal(r.data.conversation.companyUnread, 0);
  r = await call(`/company/conversations/${store[0]._id}/reply`, { method: "POST", headers: { token: tokenA }, body: { text: "Yes, still open!" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.conversation.messages.at(-1).sender, "company");
  assert.equal(r.data.conversation.userUnread, 1);

  // Seeker sees the reply as unread, then opening the job thread clears it
  r = await call("/user/conversations", { headers: seeker });
  assert.equal(r.data.conversations[0].unread, 1);
  r = await call(`/user/job/${jobA}`, { headers: seeker });
  assert.equal(r.data.conversation.messages.length, 3);
  assert.equal(r.data.conversation.userUnread, 0);

  // Another seeker can't see this conversation
  r = await call(`/user/job/${jobA}`, { headers: { "x-test-user": "user_2" } });
  assert.equal(r.data.conversation, null);
  r = await call("/user/conversations", { headers: { "x-test-user": "user_2" } });
  assert.equal(r.data.conversations.length, 0);
});
