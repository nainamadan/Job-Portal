import { test } from "node:test";
import assert from "node:assert/strict";
import Conversation from "../models/Conversation.js";
import JobApplication from "../models/JobAppliaction.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { backfillWelcomes, buildWelcomeText, ensureWelcomeConversation, welcomeForApplication } from "../utils/welcomeMessage.js";

test("welcome text names the person, job and company", () => {
  const text = buildWelcomeText({ candidateName: "Asha Rao", jobTitle: "Frontend Developer", companyName: "Acme" });
  assert.match(text, /^Hi Asha! 👋 Thanks for applying for Frontend Developer at Acme\./);
  assert.match(buildWelcomeText({}), /^Hi! 👋 Thanks for applying for this role at our company\./);
});

test("each application gets exactly one welcome, in its own job's chat with that job's recruiter", async (t) => {
  const originals = [];
  const stub = (obj, key, fn) => { originals.push([obj, key, obj[key]]); obj[key] = fn; };
  t.after(() => { for (const [o, k, v] of originals.reverse()) o[k] = v; });

  // In-memory conversations keyed by job + user, mimicking the unique index.
  const convos = [];
  const find = (f) => convos.find((c) => String(c.jobId) === String(f.jobId) && c.userId === f.userId);
  stub(Conversation, "updateOne", async (filter, update, opts = {}) => {
    const c = find(filter);
    if (update.$setOnInsert) {
      if (c) return { upsertedCount: 0, modifiedCount: 0 };
      if (opts.upsert) { convos.push({ ...structuredClone(update.$setOnInsert) }); return { upsertedCount: 1 }; }
    }
    if (!c || c.messages.some((m) => m.kind === "welcome")) return { modifiedCount: 0 };
    c.messages.push(update.$push.messages);
    c.userUnread += update.$inc.userUnread;
    return { modifiedCount: 1 };
  });

  const jobs = {
    j1: { _id: "j1", title: "Frontend Developer", companyId: "acme" },
    j2: { _id: "j2", title: "Data Analyst", companyId: "globex" },
  };
  const companies = { acme: { name: "Acme" }, globex: { name: "Globex" } };
  stub(Job, "findById", (id) => ({ select: () => ({ lean: async () => jobs[id] || null }) }));
  stub(Company, "findById", (id) => ({ select: () => ({ lean: async () => companies[id] || null }) }));
  stub(User, "findById", () => ({ select: () => ({ lean: async () => ({ name: "Asha" }) }) }));

  // New application: conversation created with the welcome first, from that job's company.
  assert.equal(await welcomeForApplication({ jobId: "j1", userId: "u1", companyId: "acme" }), true);
  assert.equal(convos.length, 1);
  assert.equal(convos[0].companyId, "acme");
  assert.equal(convos[0].messages[0].sender, "company");
  assert.equal(convos[0].messages[0].kind, "welcome");
  assert.match(convos[0].messages[0].text, /Frontend Developer at Acme/);
  assert.equal(convos[0].userUnread, 1);

  // Repeating never adds a second welcome.
  assert.equal(await welcomeForApplication({ jobId: "j1", userId: "u1", companyId: "acme" }), false);
  assert.equal(convos[0].messages.length, 1);

  // A different job is a separate chat with a different recruiter.
  await welcomeForApplication({ jobId: "j2", userId: "u1", companyId: "globex" });
  assert.equal(convos.length, 2);
  assert.equal(convos[1].companyId, "globex");
  assert.match(convos[1].messages[0].text, /Data Analyst at Globex/);

  // They messaged before applying: welcome is added to that same chat, once.
  convos.push({ jobId: "j3", userId: "u2", companyId: "acme", messages: [{ sender: "user", text: "Hi" }], userUnread: 0 });
  assert.equal(await ensureWelcomeConversation({ jobId: "j3", userId: "u2", companyId: "acme", text: "Welcome" }), true);
  assert.deepEqual(convos[2].messages.map((m) => m.kind || m.sender), ["user", "welcome"]);
  assert.equal(await ensureWelcomeConversation({ jobId: "j3", userId: "u2", companyId: "acme", text: "Welcome" }), false);

  // Unknown job: nothing created, nothing thrown.
  assert.equal(await welcomeForApplication({ jobId: "nope", userId: "u1", companyId: "acme" }), false);

  // Backfill: only applications without a welcome chat get one.
  stub(JobApplication, "find", () => ({ lean: async () => [
    { jobId: "j1", userId: "u1", companyId: "acme" }, // already has one
    { jobId: "j1", userId: "u3", companyId: "acme" }, // older application, no chat yet
  ] }));
  stub(Conversation, "find", () => ({ lean: async () => convos.filter((c) => c.messages.some((m) => m.kind === "welcome")) }));
  assert.equal(await backfillWelcomes({ companyId: "acme" }), 1);
  assert.ok(find({ jobId: "j1", userId: "u3" }));
});
