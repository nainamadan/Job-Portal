import { test } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import express from "express";
import jwt from "jsonwebtoken";
import { Webhook } from "svix";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import { changeJobApplicationStatus } from "../controllers/companyController.js";
import { getJobs } from "../controllers/jobController.js";
import { protectCompany } from "../middleware/authMiddleware.js";
import { createTransporter } from "../utils/emailTransport.js";
import clerkWebhooks from "../controllers/webhooks.js";
import { ensureCandidateProfile, hasDeliverableEmail } from "../utils/candidateProfile.js";

// Real HTTP/auth/controller/SMTP flow, with model methods stubbed to avoid live DB writes.
test("candidate search and recruiter status notification workflows", async (t) => {
  const originalEnv = { ...process.env };
  const originals = [];
  const stub = (obj, key, fn) => { originals.push([obj, key, obj[key]]); obj[key] = fn; };
  const messages = [];
  let rejectRecipient = false;
  const smtp = net.createServer((socket) => {
    socket.setEncoding("utf8");
    socket.write("220 localhost SMTP test receiver\r\n");
    let buffer = "", inData = false, message = "", recipient = "";
    socket.on("data", (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 2);
        if (inData) {
          if (line === ".") {
            messages.push({ recipient, raw: message.replace(/=\r\n/g, "").replace(/=([\dA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) });
            inData = false; message = ""; socket.write("250 Message accepted\r\n");
          } else message += line + "\r\n";
        } else if (/^EHLO|^HELO/i.test(line)) socket.write("250-localhost\r\n250 AUTH PLAIN\r\n");
        else if (/^AUTH/i.test(line)) socket.write("235 Authenticated\r\n");
        else if (/^RCPT TO:/i.test(line)) {
          recipient = line;
          socket.write(rejectRecipient ? "550 Recipient rejected\r\n" : "250 OK\r\n");
        } else if (line === "DATA") { inData = true; socket.write("354 End with dot\r\n"); }
        else if (line === "QUIT") socket.end("221 Bye\r\n");
        else socket.write("250 OK\r\n");
      }
    });
    socket.on("error", () => {});
  });
  await new Promise((resolve) => smtp.listen(0, "127.0.0.1", resolve));
  Object.assign(process.env, { SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.address().port),
    SMTP_USER: "sender@example.test", SMTP_PASS: "test-only", EMAIL_FROM: "sender@example.test",
    SMTP_SECURE: "false", JWT_SECRET: "test-only-jwt-secret" });
  const companyId = "507f1f77bcf86cd799439011", applicationId = "507f1f77bcf86cd799439012";
  let application;
  const reset = (status = "pending") => { application = { _id: applicationId, companyId,
    userId: "user_test", jobId: "507f1f77bcf86cd799439013", status, statusRevision: 0 }; };
  reset();
  stub(User, "findById", async () => ({ _id: "user_test", name: "Alex <Candidate>", email: "candidate@example.test" }));
  stub(Company, "findById", (id) => ({ select: async () => String(id) === companyId
    ? { _id: companyId, name: "Example & Co", email: "recruiter@example.test" } : null }));
  stub(Job, "findById", () => ({ select: async () => ({ title: "React Developer" }) }));
  stub(JobApplication, "findById", async (id) => id === applicationId ? { ...application } : null);
  stub(JobApplication, "findOneAndUpdate", async (filter, update) => {
    assert.equal(String(filter.companyId), companyId);
    assert.deepEqual(filter.$expr.$ne[0], { $toLower: { $ifNull: ["$status", "pending"] } });
    if ((application.status || "pending").toLowerCase() === filter.$expr.$ne[1]) return null;
    application = { ...application, ...update.$set, statusRevision: application.statusRevision + 1 };
    return { ...application };
  });
  stub(JobApplication, "updateOne", async (filter, update) => {
    if (application.statusRevision === filter.statusRevision) Object.assign(application, update.$set);
  });
  let lastFilter;
  stub(Job, "find", (filter) => { lastFilter = filter; return { populate: async () => [] }; });
  const app = express(); app.use(express.json());
  app.put("/status/:applicationId", protectCompany, changeJobApplicationStatus);
  app.get("/jobs", getJobs);
  const http = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => http.once("listening", resolve));
  const base = `http://127.0.0.1:${http.address().port}`;
  const token = jwt.sign({ id: companyId }, process.env.JWT_SECRET);
  const request = async (status, options = {}) => {
    const response = await fetch(`${base}/status/${options.id || applicationId}`, { method: "PUT",
      headers: { "Content-Type": "application/json", ...(options.noAuth ? {} : { token: options.token || token }) },
      body: JSON.stringify({ status, candidateEmail: "untrusted@example.test", ...options.details }) });
    return { status: response.status, body: await response.json() };
  };
  t.after(async () => {
    for (const [obj, key, fn] of originals.reverse()) obj[key] = fn;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
    http.closeAllConnections();
    await Promise.all([new Promise((resolve) => http.close(resolve)), new Promise((resolve) => smtp.close(resolve))]);
  });

  await t.test("acceptance sends professional mail to database email and supports company replies", async () => {
    const result = await request("Accepted");
    assert.equal(result.status, 200); assert.equal(result.body.emailSent, true);
    assert.equal(application.statusNotification.state, "sent");
    assert.equal(messages.length, 1);
    assert.match(messages[0].recipient, /candidate@example.test/);
    assert.match(messages[0].raw, /Subject: Application accepted:/);
    assert.match(messages[0].raw, /Reply-To: recruiter@example.test/);
    assert.match(messages[0].raw, /Congratulations/);
    assert.match(messages[0].raw, /Alex &lt;Candidate&gt;/);
    assert.match(messages[0].raw, /Example &amp; Co/);
    assert.doesNotMatch(messages[0].raw, /11:00|Google Meet|untrusted@example/);
  });
  await t.test("repeated and concurrent same-status requests do not duplicate mail", async () => {
    assert.equal((await request("accepted")).body.changed, false);
    reset(); const before = messages.length;
    const results = await Promise.all(Array.from({ length: 5 }, () => request("Accepted")));
    assert.equal(results.filter((result) => result.body.changed).length, 1);
    assert.equal(messages.length - before, 1);
  });
  await t.test("rejection sends one polite update; pending sends none", async () => {
    const before = messages.length;
    assert.equal((await request("Rejected")).body.emailSent, true);
    assert.match(messages.at(-1).raw, /not selected/);
    assert.match(messages.at(-1).raw, /Status: Rejected/);
    assert.equal((await request("Rejected")).body.changed, false);
    assert.equal((await request("Pending")).body.emailSent, false);
    assert.equal(messages.length - before, 1);
  });
  await t.test("only actual recruiter interview details are stored and sent", async () => {
    reset();
    const result = await request("Accepted", { details: { interviewDate: "2027-01-15", interviewTime: "14:30 IST",
      interviewType: "Video", interviewLink: "https://example.test/interview", notes: "Bring <resume>" } });
    assert.equal(result.body.emailSent, true);
    assert.equal(application.interviewDetails.date, "2027-01-15");
    assert.match(messages.at(-1).raw, /2027-01-15/);
    assert.match(messages.at(-1).raw, /Bring &lt;resume&gt;/);
    assert.equal((await request("Rejected", { details: { rejectionReason: "Thank you for applying." } })).body.emailSent, true);
    assert.equal(application.feedback, "Thank you for applying.");
    assert.match(messages.at(-1).raw, /Recruiter feedback/);
  });
  await t.test("SMTP refusal preserves status, reports failure, and a retry does not duplicate the update", async () => {
    rejectRecipient = true;
    const result = await request("Accepted");
    assert.equal(result.status, 200); assert.equal(result.body.success, true);
    assert.equal(result.body.emailSent, false); assert.equal(application.status, "Accepted");
    assert.equal(application.statusNotification.state, "failed");
    assert.equal((await request("Accepted")).body.changed, false);
    rejectRecipient = false;
  });
  await t.test("authentication, ownership, status validation and missing applications are enforced", async () => {
    assert.equal((await request("Accepted", { noAuth: true })).status, 401);
    const owner = application.companyId; application.companyId = "507f1f77bcf86cd799439099";
    assert.equal((await request("Rejected")).status, 403); application.companyId = owner;
    for (const status of ["Other", "constructor", "__proto__", null, { $ne: "" }]) assert.equal((await request(status)).status, 400);
    assert.equal((await request("Accepted", { id: "bad-id" })).status, 400);
    assert.equal((await request("Accepted", { id: "507f1f77bcf86cd799439098" })).status, 404);
  });
  await t.test("jobs API passes combined filters to the database and preserves empty results", async () => {
    const result = await fetch(`${base}/jobs?minSalary=10&maxSalary=20&title=React&levels=1-3+Years&skills=React&categories=Programming`);
    assert.equal(result.status, 200); assert.deepEqual((await result.json()).jobs, []);
    assert.deepEqual(lastFilter.salary, { $gte: 10, $lte: 20 });
    // 3 search clauses + the "deadline not passed" rule that hides expired jobs.
    assert.equal(lastFilter.$and.length, 4);
    const openRule = (f) => f.$and.at(-1).$or;
    assert.ok(openRule(lastFilter)[0].applicationDeadline.$gt instanceof Date);
    assert.deepEqual(openRule(lastFilter)[1], { applicationDeadline: null });
    const invalid = await fetch(`${base}/jobs?minSalary=20&maxSalary=10`);
    assert.equal(invalid.status, 400);
    await fetch(`${base}/jobs`);
    assert.equal(lastFilter.visible, true);
    assert.equal(lastFilter.$and.length, 1, "no search: only the open-deadline rule");
  });
  await t.test("missing email configuration fails explicitly instead of creating a test inbox", async () => {
    const names = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "GMAIL_USER", "GMAIL_PASS"];
    const values = names.map((name) => process.env[name]); names.forEach((name) => delete process.env[name]);
    await assert.rejects(createTransporter, /Email is not configured/);
    names.forEach((name, index) => { if (values[index] !== undefined) process.env[name] = values[index]; });
  });
  await t.test("signed Clerk event stores primary email and is safe to replay", async () => {
    let saved;
    stub(User, "findOneAndUpdate", async (filter, update, options) => { saved = { filter, update, options }; });
    const secret = `whsec_${Buffer.from("test-only-webhook-secret").toString("base64")}`;
    process.env.CLERK_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({ type: "user.created", data: { id: "user_test", first_name: "Alex",
      primary_email_address_id: "primary", email_addresses: [
        { id: "other", email_address: "other@example.test" }, { id: "primary", email_address: "primary@example.test" },
      ] } }, null, 2);
    const date = new Date(); const id = "msg_test";
    const req = { body: Buffer.from(payload), headers: { "svix-id": id, "svix-timestamp": String(Math.floor(date.getTime() / 1000)),
      "svix-signature": new Webhook(secret).sign(id, date, payload) } };
    let status; const res = { status(value) { status = value; return this; }, json(value) { return value; } };
    await clerkWebhooks(req, res); await clerkWebhooks(req, res);
    assert.equal(status, 200); assert.equal(saved.update.$set.email, "primary@example.test");
    assert.equal(saved.options.upsert, true); assert.ok(saved.update.$setOnInsert);
  });
  await t.test("legacy placeholder accounts are repaired from Clerk primary email, without replacing resumes", async () => {
    assert.equal(hasDeliverableEmail("user@clerk.user"), false);
    assert.equal(hasDeliverableEmail("a@example.test,b@example.test"), false);
    stub(User, "findById", async () => ({ _id: "user_test", email: "user_test@clerk.user" }));
    const provider = { users: { getUser: async (id) => {
      assert.equal(id, "user_test");
      return { primaryEmailAddressId: "primary", firstName: "Alex", emailAddresses: [
        { id: "other", emailAddress: "other@example.test" }, { id: "primary", emailAddress: "primary@example.test" },
      ] };
    } } };
    stub(User, "findOneAndUpdate", async (filter, update) => {
      assert.equal(filter._id, "user_test");
      assert.equal(update.$set.email, "primary@example.test");
      assert.equal(update.$set.resume, undefined);
      assert.equal(update.$set.savedJobs, undefined);
      return { ...update.$set };
    });
    assert.equal((await ensureCandidateProfile("user_test", provider)).email, "primary@example.test");
    await assert.rejects(ensureCandidateProfile("user_test", { users: { getUser: async () => ({ emailAddresses: [] }) } }), /no registered primary email/);
  });
});
