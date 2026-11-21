import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import Portfolio from "../models/Portfolio.js";
import { createPortfolioRouter } from "../routes/portfolioRoutes.js";
import { validatePortfolio, validatePortfolioPhoto, importGithubProjects, PortfolioError } from "../utils/portfolio.js";

const input = { name: "Example Candidate", headline: "Software developer", email: "candidate@example.test", skills: ["React"], projects: [{ id: "github-1", title: "Job board", description: "A responsive job search tool", language: "JavaScript", sourceUrl: "https://github.com/example/board", demoUrl: "" }], theme: "studio", accent: "indigo", photo: "" };

test("portfolio validation bounds content, links and image formats without trusting ownership", async () => {
  const value = validatePortfolio({ ...input, userId: "other", revision: 55 });
  assert.equal(value.userId, undefined);
  assert.equal(value.revision, undefined);
  assert.equal(validatePortfolioPhoto("data:image/jpeg;base64,/9j/AA=="), "data:image/jpeg;base64,/9j/AA==");
  for (const invalid of [
    { name: "x".repeat(201) }, { email: "not-an-email" }, { skills: new Array(41).fill("React") },
    { github: "https://github.com@localhost/" }, { website: "javascript:alert(1)" }, { theme: "injected" },
    { accent: "red;background:url(evil)" }, { photo: "data:image/svg+xml;base64,PHN2Zz4=" },
    { photo: "data:image/jpeg;base64,aGVsbG8=" }, { photo: "x".repeat(700001) },
    { projects: new Array(7).fill(input.projects[0]) }, { projects: [{ ...input.projects[0], sourceUrl: "http://example.test" }] },
    { projects: [{ ...input.projects[0], title: "" }] }, { projects: [input.projects[0], input.projects[0]] },
  ]) assert.throws(() => validatePortfolio({ ...input, ...invalid }));
  const model = new Portfolio({ ...value, userId: "user_one" });
  await model.validate(); assert.equal(model.revision, 1);
  assert.ok(Portfolio.schema.indexes().some(([index, options]) => index.userId === 1 && options.unique));
});

test("GitHub import uses fixed public endpoints, excludes forks/private archives and handles provider errors", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 200, json: async () => url.includes("/repos?") ? [
      { id: 1, name: "board", owner: { login: "example" }, description: '<script>unsafe text</script>', language: "JavaScript", homepage: "javascript:alert(1)" },
      { id: 2, name: "fork", owner: { login: "example" }, fork: true },
      { id: 3, name: "archive", owner: { login: "example" }, archived: true },
      { id: 4, name: "secret", owner: { login: "example" }, private: true },
      { id: 5, name: "other", owner: { login: "another" } },
    ] : { login: "example", name: "Example", bio: "Building useful tools" } };
  };
  const result = await importGithubProjects("example", { fetchImpl });
  assert.equal(calls.length, 2); assert.ok(calls.every((call) => call.url.startsWith("https://api.github.com/users/example") && call.options.redirect === "error"));
  assert.equal(result.projects.length, 1); assert.equal(result.projects[0].sourceUrl, "https://github.com/example/board");
  assert.equal(result.projects[0].demoUrl, ""); assert.equal(result.profile.github, "https://github.com/example");
  assert.equal(calls[0].options.headers.Authorization, undefined, "does not forward candidate credentials to GitHub");
  await assert.rejects(() => importGithubProjects("../internal", { fetchImpl }));
  for (const [status, expected] of [[404, 404], [403, 429], [429, 429], [500, 502]]) {
    await assert.rejects(() => importGithubProjects("example", { fetchImpl: async () => ({ status, ok: false }) }), (error) => error instanceof PortfolioError && error.status === expected);
  }
  await assert.rejects(() => importGithubProjects("example", { fetchImpl: async () => { throw new Error("network"); } }), (error) => error.status === 502);
});

test("private draft HTTP routes enforce ownership, concurrency, validation and import limits", async (t) => {
  const originals = [];
  const stub = (key, value) => { originals.push([key, Portfolio[key]]); Portfolio[key] = value; };
  const store = [];
  const matches = (doc, filter) => Object.entries(filter).every(([key, value]) => doc[key] === value);
  const query = (value) => ({ lean: async () => structuredClone(value) });
  stub("findOne", (filter) => query(store.find((doc) => matches(doc, filter)) || null));
  stub("create", async (value) => {
    if (store.some((doc) => doc.userId === value.userId)) throw Object.assign(new Error("duplicate"), { code: 11000 });
    const doc = { ...structuredClone(value), revision: 1, __v: 0, updatedAt: new Date().toISOString() }; store.push(doc); return structuredClone(doc);
  });
  stub("findOneAndUpdate", (filter, update) => {
    const doc = store.find((value) => matches(value, filter));
    if (doc) { Object.assign(doc, structuredClone(update.$set)); doc.revision += update.$inc.revision; }
    return query(doc || null);
  });
  let time = 0, imports = 0;
  const app = express(); app.use(express.json({ limit: "1mb" }));
  app.use((req, _res, next) => { req.auth = { userId: req.headers["x-test-user"] || null }; next(); });
  app.use("/api/portfolios", createPortfolioRouter({ now: () => time, importProjects: async (username) => { imports++; return { username, profile: { github: `https://github.com/${username}` }, projects: [] }; } }));
  const server = app.listen(0, "127.0.0.1"); await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => { await new Promise((resolve) => server.close(resolve)); for (const [key, value] of originals) Portfolio[key] = value; });
  const call = async (path, method = "GET", body, userId = "user_one") => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/portfolios${path}`, { method, headers: { "content-type": "application/json", ...(userId ? { "x-test-user": userId } : {}) }, body: body && JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  };
  assert.equal((await call("/mine", "GET", undefined, null)).status, 401);
  assert.equal((await call("/github/example", "GET", undefined, null)).status, 401);
  assert.equal((await call("/mine")).data.portfolio, null);
  let r = await call("/mine", "PUT", { ...input, revision: 0, userId: "user_two" });
  assert.equal(r.status, 200); assert.equal(r.data.portfolio.userId, undefined); assert.equal(r.data.portfolio.__v, undefined);
  assert.equal((await call("/mine", "GET", undefined, "user_two")).data.portfolio, null);
  assert.equal((await call("/mine", "PUT", { ...input, revision: 0 })).status, 409, "cannot overwrite an existing draft with a fresh create");
  assert.equal((await call("/mine", "PUT", { ...input, revision: "1" })).status, 400);
  assert.equal((await call("/mine", "PUT", { ...input, revision: 1, projects: [{ ...input.projects[0], demoUrl: "javascript:alert(1)" }] })).status, 400);
  const results = await Promise.all([call("/mine", "PUT", { ...input, name: "Edit one", revision: 1 }), call("/mine", "PUT", { ...input, name: "Edit two", revision: 1 })]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.equal((await call("/mine")).data.portfolio.revision, 2);
  assert.equal((await call("/mine", "PUT", { ...input, revision: 1 }, "user_two")).status, 409, "another account cannot modify the first user's draft");
  assert.equal((await call("/github/not%20valid")).status, 400);
  for (let count = 0; count < 5; count++) assert.equal((await call("/github/example")).status, 200);
  assert.equal((await call("/github/example")).status, 429); assert.equal(imports, 5);
  assert.equal((await call("/github/example", "GET", undefined, "user_two")).status, 200);
  time = 600001; assert.equal((await call("/github/example")).status, 200, "import window expires");
});
