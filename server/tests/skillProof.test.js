import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
import JobApplication from "../models/JobAppliaction.js";
import SkillProof from "../models/SkillProof.js";
import skillProofRoutes from "../routes/skillProofRoutes.js";
import { validateProof, evidenceUrl, SKILL_CHALLENGES } from "../utils/skillProof.js";

const submission = {
  title: "Accessible React job board", skills: ["React", "JavaScript"], challengeId: "react-search",
  summary: "A working job board with combined title and location filters, including loading and error states.",
  contribution: "I built the search components, added keyboard navigation and wrote tests for failed network requests.",
  sourceUrl: "https://github.com/example/board", demoUrl: "https://example.com/board", writeupUrl: "",
};

test("skill evidence validates meaningful submissions and safe link formats", async () => {
  assert.equal(validateProof(submission).skills.length, 2);
  assert.equal(SKILL_CHALLENGES.length, 5);
  for (const sourceUrl of ["javascript:alert(1)", "data:text/html,test", "http://example.com", "https://user:secret@example.com", "https://localhost/x", "https://127.0.0.1/x", "https://192.168.1.1/x", "https://[::1]/x"]) {
    assert.throws(() => evidenceUrl(sourceUrl, "Code", true), /public HTTPS/);
  }
  for (const invalid of [{ skills: [] }, { skills: ["React", "react"] }, { skills: ["Python"] }, { summary: "I know React" }, { contribution: "Built it" }, { challengeId: "forged" }, { sourceUrl: "" }, { skills: [{ $gt: "" }] }]) {
    assert.throws(() => validateProof({ ...submission, ...invalid }));
  }
  const validated = validateProof({ ...submission, userId: "other", reviews: [{ status: "approved" }], revision: 99 });
  assert.equal(validated.userId, undefined);
  assert.equal(validated.reviews, undefined);
  assert.equal(validated.revision, undefined);
  const model = new SkillProof({ ...validated, userId: "user_one" });
  await model.validate();
  assert.equal(model.revision, 1);
  assert.deepEqual(model.reviews.toObject(), []);
  assert.equal(SkillProof.schema.path("reviews").schema.path("companyId").instance, "ObjectId");
});

test("vault HTTP flow protects ownership, reviewer access, feedback and content versions", async (t) => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "skill-proof-test-only-secret";
  const originals = [];
  const stub = (obj, key, value) => { originals.push([obj, key, obj[key]]); obj[key] = value; };
  const companyA = "507f1f77bcf86cd799439011", companyB = "507f1f77bcf86cd799439012", companyC = "507f1f77bcf86cd799439013";
  const appA = "507f1f77bcf86cd799439021", appB = "507f1f77bcf86cd799439022", otherApp = "507f1f77bcf86cd799439023";
  const applications = [{ _id: appA, companyId: companyA, userId: "user_one" }, { _id: appB, companyId: companyB, userId: "user_one" }, { _id: otherApp, companyId: companyA, userId: "user_two" }];
  const store = [];
  let serial = 100;
  let concurrentReads = null;
  const copy = (value) => value === undefined ? value : structuredClone(value);
  const matches = (doc, filter) => Object.entries(filter).every(([key, value]) => String(doc[key]) === String(value));
  const query = (value) => ({
    select() { return this; }, sort() { return this; }, lean: async () => copy(await value),
    then: (resolve, reject) => Promise.resolve(value).then((doc) => resolve(copy(doc)), reject),
  });
  stub(Company, "findById", (id) => query([companyA, companyB, companyC].includes(id) ? { _id: id, name: `Company ${id.slice(-1)}` } : null));
  stub(JobApplication, "findOne", (filter) => query(applications.find((doc) => matches(doc, filter)) || null));
  stub(SkillProof, "create", async (input) => {
    const model = new SkillProof(input);
    await model.validate();
    const doc = { ...model.toObject(), _id: (++serial).toString(16).padStart(24, "0"), __v: 0 };
    store.push(copy(doc)); return copy(doc);
  });
  stub(SkillProof, "find", (filter) => query(store.filter((doc) => matches(doc, filter))));
  stub(SkillProof, "findOne", (filter) => {
    const doc = copy(store.find((item) => matches(item, filter)) || null);
    if (concurrentReads) {
      return query(new Promise((resolve) => {
        concurrentReads.push(() => resolve(doc));
        if (concurrentReads.length === 2) {
          const waiting = concurrentReads; concurrentReads = null;
          waiting.forEach((release) => release());
        }
      }));
    }
    return query(doc);
  });
  stub(SkillProof, "exists", async (filter) => store.some((doc) => matches(doc, filter)));
  stub(SkillProof, "findOneAndUpdate", (filter, update) => {
    const doc = store.find((item) => matches(item, filter));
    if (doc) {
      Object.assign(doc, copy(update.$set || {}));
      for (const [key, value] of Object.entries(update.$inc || {})) doc[key] = (doc[key] || 0) + value;
    }
    return query(doc || null);
  });
  stub(SkillProof, "findOneAndDelete", async (filter) => {
    const index = store.findIndex((doc) => matches(doc, filter));
    return index === -1 ? null : store.splice(index, 1)[0];
  });

  const app = express();
  app.use(express.json());
  // Controlled stand-in for Clerk; production routes still read the middleware's authenticated user.
  app.use((req, _res, next) => { req.auth = { userId: req.headers["x-test-user"] || null }; next(); });
  app.use("/api/skill-proofs", skillProofRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    for (const [obj, key, value] of originals.reverse()) obj[key] = value;
    if (oldSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldSecret;
  });
  const base = `http://127.0.0.1:${server.address().port}/api/skill-proofs`;
  const seeker = { "x-test-user": "user_one" }, other = { "x-test-user": "user_two" };
  const recruiter = (id) => ({ token: jwt.sign({ id }, process.env.JWT_SECRET) });
  const call = async (path, { method = "GET", body, headers = {} } = {}) => {
    const response = await fetch(base + path, { method, headers: { "content-type": "application/json", ...headers }, body: body && JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  };
  const review = { status: "approved", note: "I inspected the filters, keyboard support and tests; they demonstrate the stated React skills.", reviewedEvidence: true, revision: 1 };

  assert.equal((await call("/challenges")).data.challenges.length, 5);
  assert.equal((await call("/mine")).status, 401);
  assert.equal((await call("/mine", { method: "POST", body: submission })).status, 401);
  assert.equal((await call("/mine", { method: "POST", headers: seeker, body: { ...submission, sourceUrl: "javascript:alert(1)" } })).status, 400);
  let response = await call("/mine", { method: "POST", headers: seeker, body: { ...submission, userId: "user_two", reviews: [review], revision: 99 } });
  assert.equal(response.status, 201);
  const id = response.data.proof._id;
  assert.equal(response.data.proof.userId, undefined);
  assert.equal(response.data.proof.revision, 1);
  assert.deepEqual(response.data.proof.reviews, []);
  assert.equal((await call("/mine", { headers: other })).data.proofs.length, 0);
  assert.equal((await call(`/mine/${id}`, { method: "PATCH", headers: other, body: { ...submission, revision: 1 } })).status, 404);
  assert.equal((await call(`/mine/${id}`, { method: "DELETE", headers: other, body: { revision: 1 } })).status, 404);
  assert.equal((await call("/mine/not-an-id", { method: "PATCH", headers: seeker, body: submission })).status, 400);

  assert.equal((await call(`/company/applications/${appA}`)).status, 401);
  assert.equal((await call(`/company/applications/${appA}`, { headers: { token: "bad-token" } })).status, 401);
  assert.equal((await call(`/company/applications/${appA}`, { headers: recruiter(companyB) })).status, 404);
  assert.equal((await call(`/company/applications/${appA}`, { headers: recruiter(companyC) })).status, 404);
  assert.equal((await call(`/company/applications/${appA}`, { headers: recruiter(companyA) })).data.proofs.length, 1);
  assert.equal((await call(`/company/applications/${otherApp}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: review })).status, 404);
  assert.equal((await call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyB), body: review })).status, 404);
  assert.equal((await call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: { ...review, reviewedEvidence: false } })).status, 400);
  assert.equal((await call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: { ...review, status: "verified" } })).status, 400);
  assert.equal((await call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: { ...review, note: "" } })).status, 400);

  response = await call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: { ...review, companyId: companyB } });
  assert.equal(response.status, 200);
  assert.equal(response.data.proof.reviews[0].companyId, companyA, "company identity cannot be forged");
  assert.equal((await call(`/company/applications/${appB}`, { headers: recruiter(companyB) })).data.proofs[0].reviews.length, 0, "other company's feedback stays private");
  response = await call(`/company/applications/${appB}/${id}/review`, { method: "PUT", headers: recruiter(companyB), body: { ...review, status: "needs_work", note: "Please add tests for the combined filters." } });
  assert.equal(response.data.proof.reviews.length, 1);
  response = await call("/mine", { headers: seeker });
  assert.equal(response.data.proofs[0].reviews.length, 2, "candidate sees both companies' feedback");

  response = await call(`/mine/${id}`, { method: "PATCH", headers: seeker, body: { ...submission, revision: 1, title: "Updated React board and tests" } });
  assert.equal(response.status, 200);
  assert.equal(response.data.proof.revision, 2);
  assert.deepEqual(response.data.proof.reviews, [], "editing atomically clears all approvals");
  assert.equal((await call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: review })).status, 409, "reviewing an old version is blocked");
  assert.equal((await call(`/mine/${id}`, { method: "PATCH", headers: seeker, body: { ...submission, revision: 1 } })).status, 409);
  assert.equal((await call(`/mine/${id}`, { method: "DELETE", headers: seeker, body: { revision: 1 } })).status, 409);
  assert.equal((await call(`/mine/${id}`, { method: "DELETE", headers: seeker, body: { revision: "2" } })).status, 400);

  concurrentReads = [];
  const concurrent = await Promise.all([
    call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: { ...review, revision: 2 } }),
    call(`/company/applications/${appB}/${id}/review`, { method: "PUT", headers: recruiter(companyB), body: { ...review, revision: 2 } }),
  ]);
  assert.deepEqual(concurrent.map((item) => item.status).sort(), [200, 409], "simultaneous reviews cannot overwrite each other");
  const failedCompany = concurrent[0].status === 409 ? companyA : companyB;
  const failedApp = failedCompany === companyA ? appA : appB;
  assert.equal((await call(`/company/applications/${failedApp}/${id}/review`, { method: "PUT", headers: recruiter(failedCompany), body: { ...review, revision: 2 } })).status, 200);
  assert.equal((await call("/mine", { headers: seeker })).data.proofs[0].reviews.length, 2);
  response = await call(`/mine/${id}`, { method: "DELETE", headers: seeker, body: { revision: 2 } });
  assert.equal(response.status, 200);
  assert.equal((await call(`/company/applications/${appA}`, { headers: recruiter(companyA) })).data.proofs.length, 0);
  assert.equal((await call(`/company/applications/${appA}/${id}/review`, { method: "PUT", headers: recruiter(companyA), body: { ...review, revision: 2 } })).status, 404);
});
