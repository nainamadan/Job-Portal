import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import companyRoutes from "../routes/companyRoutes.js";
import { currentStage, stageToStatus, statusToStage } from "../utils/hiringStages.js";

test("stage helpers keep the old status in sync", () => {
  assert.equal(stageToStatus("shortlisted"), "Pending");
  assert.equal(stageToStatus("offered"), "Accepted");
  assert.equal(stageToStatus("rejected"), "Rejected");
  assert.equal(statusToStage("Accepted"), "interview");
  assert.equal(currentStage({ status: "Rejected" }), "rejected", "older records without a stage");
  assert.equal(currentStage({ status: "pending" }), "applied");
  assert.equal(currentStage({ stage: "hired", status: "Accepted" }), "hired");
});

test("recruiter moves an application through the hiring stages", async (t) => {
  const saved = { ...process.env };
  for (const k of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "GMAIL_USER", "GMAIL_PASS", "EMAIL_FROM"]) delete process.env[k];
  process.env.JWT_SECRET = "test-only-jwt-secret";
  const originals = [];
  const stub = (obj, key, fn) => { originals.push([obj, key, obj[key]]); obj[key] = fn; };

  const companyA = "507f1f77bcf86cd799439011", companyB = "507f1f77bcf86cd799439099";
  const appId = "507f1f77bcf86cd799439012";
  const app = { _id: appId, companyId: companyA, userId: "user_1", jobId: "507f1f77bcf86cd799439013", status: "Pending", stage: "applied", stageHistory: [], statusRevision: 0 };
  const updates = [];

  stub(Company, "findById", (id) => ({ select: async () => ([companyA, companyB].includes(String(id)) ? { _id: String(id), name: "Acme", email: "hr@acme.test" } : null) }));
  stub(User, "findById", async () => ({ _id: "user_1", name: "Asha", email: "asha@example.test" }));
  stub(Job, "findById", () => ({ select: async () => ({ title: "Frontend Developer" }) }));
  stub(JobApplication, "findOne", (filter) => ({ select: async () => (String(filter.companyId) === companyA && filter._id === appId ? { _id: appId } : null) }));
  stub(JobApplication, "findOneAndUpdate", async (filter, update) => {
    updates.push(update);
    if (filter._id !== appId || String(filter.companyId) !== companyA) return null;
    if (filter.stage?.$ne === app.stage) return null;
    Object.assign(app, update.$set);
    app.stageHistory.push(update.$push.stageHistory);
    return { ...app };
  });

  const server = express().use(express.json()).use("/api/company", companyRoutes).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(async () => {
    await new Promise((r) => server.close(r));
    for (const [o, k, v] of originals.reverse()) o[k] = v;
    process.env = saved;
  });
  const base = `http://127.0.0.1:${server.address().port}/api/company`;
  const put = async (path, body, token = jwt.sign({ id: companyA }, process.env.JWT_SECRET)) => {
    const res = await fetch(base + path, { method: "PUT", headers: { "content-type": "application/json", token }, body: JSON.stringify(body) });
    return { status: res.status, data: await res.json() };
  };
  const stagePath = `/applications/${appId}/stage`;

  let r = await put(stagePath, { stage: "shortlisted", note: "Great portfolio!", notifyCandidate: false });
  assert.equal(r.status, 200);
  assert.equal(r.data.changed, true);
  assert.equal(app.stage, "shortlisted");
  assert.equal(app.status, "Pending");
  assert.equal(app.stageHistory.at(-1).note, "Great portfolio!");

  r = await put(stagePath, { stage: "shortlisted", notifyCandidate: false });
  assert.equal(r.data.changed, false, "same stage twice adds nothing");
  assert.equal(app.stageHistory.length, 1);

  r = await put(stagePath, { stage: "offered", notifyCandidate: false });
  assert.equal(app.status, "Accepted", "offer keeps the old status in sync");

  // Email failure (no SMTP here) must not lose the stage change.
  r = await put(stagePath, { stage: "hired" });
  assert.equal(r.status, 200);
  assert.equal(app.stage, "hired");
  assert.equal(r.data.emailSent, false);

  // Validation and ownership
  assert.equal((await put(stagePath, { stage: "interview" })).status, 400, "interview goes through Accept");
  assert.equal((await put(stagePath, { stage: "rejected" })).status, 400, "rejection goes through Reject");
  assert.equal((await put(stagePath, { stage: "promoted" })).status, 400);
  assert.equal((await put(stagePath, { stage: "applied", note: "x".repeat(1001) })).status, 400);
  assert.equal((await put("/applications/not-an-id/stage", { stage: "applied" })).status, 400);
  r = await put(stagePath, { stage: "applied", notifyCandidate: false }, jwt.sign({ id: companyB }, process.env.JWT_SECRET));
  assert.equal(r.status, 404, "another company cannot move it");
  assert.equal(app.stage, "hired");
  assert.equal((await put(stagePath, { stage: "applied" }, "bad-token")).status, 401);

  // Accept / Reject also record the stage and a timeline note.
  stub(JobApplication, "findById", async () => ({ ...app, companyId: { toString: () => companyA } }));
  stub(JobApplication, "updateOne", async () => ({ acknowledged: true }));
  app.status = "Pending";
  r = await put(`/change-status/${appId}`, { status: "Accepted", interviewDate: "2026-12-01", interviewTime: "10:00 AM", interviewType: "Online" });
  const acceptUpdate = updates.at(-1);
  assert.equal(acceptUpdate.$set.stage, "interview");
  assert.equal(acceptUpdate.$push.stageHistory.stage, "interview");
  assert.match(acceptUpdate.$push.stageHistory.note, /Interview on 2026-12-01 at 10:00 AM · Online/);
});
