import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import LearningRoadmap from "../models/LearningRoadmap.js";
import { createRoadmapRouter, createGenerationLimit } from "../routes/roadmapRoutes.js";
import { generateLearningRoadmap, normalizeRoadmap, roadmapProgress, roadmapResponseSchema, safeDocumentationUrl, validateLearningRequest } from "../utils/learningRoadmap.js";

const fixture = () => ({
  title: "Python learning journey", description: "A practical path from foundations to projects.",
  nodes: Array.from({ length: 12 }, (_, index) => ({
    id: `n${index}`, title: `Python topic ${index}`, kind: ["prerequisite", "topic", "practice", "project", "milestone"][index % 5],
    estimatedHours: 2, summary: "Build and practise a useful skill.",
    explanation: "Learn the idea, then use it in a small working example.",
    exercises: ["Write and run an example, then explain its output."],
    documentation: [{ title: "Python documentation", url: "https://docs.python.org/3/tutorial/" }],
    youtubeQuery: `Python topic ${index} tutorial`,
  })),
  edges: [
    ["n0", "n1"], ["n0", "n2"], ["n1", "n3"], ["n2", "n3"],
    ...Array.from({ length: 8 }, (_, index) => [`n${index + 3}`, `n${index + 4}`]),
  ].map(([source, target]) => ({ source, target })),
});

test("roadmap requests and AI graphs validate content, branches, prerequisites, and resource safety", () => {
  assert.deepEqual(validateLearningRequest({ skill: "  Python  " }), { skill: "Python", level: "beginner", hoursPerWeek: 5 });
  for (const input of [null, [], { skill: " " }, { skill: "x".repeat(101) }, { skill: "React", level: "expert" }, { skill: "React", hoursPerWeek: "5" }, { skill: "React", hoursPerWeek: 0 }]) {
    assert.throws(() => validateLearningRequest(input), (error) => error.status === 400);
  }
  assert.equal(safeDocumentationUrl("https://docs.python.org/3/"), "https://docs.python.org/3/");
  for (const url of ["javascript:alert(1)", "data:text/html,test", "http://docs.python.org", "https://127.0.0.1/", "https://localhost/", "https://[::1]/", "https://example.com/", "https://user:secret@docs.python.org/", "https://host.internal/"]) {
    assert.equal(safeDocumentationUrl(url), null, url);
  }
  const normalized = normalizeRoadmap(fixture());
  assert.equal(normalized.nodes.length, 12);
  assert.equal(normalized.nodes.every((node) => node.completed === false), true);
  assert.equal(new Set(normalized.edges.map((edge) => edge.id)).size, normalized.edges.length);
  for (const corrupt of [
    (raw) => { raw.nodes[1].id = raw.nodes[0].id; },
    (raw) => { raw.nodes[0].id = 12; },
    (raw) => { raw.edges.push({ source: "n11", target: "n0" }); },
    (raw) => { raw.edges.push({ source: "missing", target: "n2" }); },
    (raw) => { raw.edges = raw.edges.filter((edge) => edge.target !== "n11"); },
    (raw) => { raw.edges.push(raw.edges[0]); },
    (raw) => { raw.nodes[1].documentation[0].url = "javascript:alert(1)"; },
    (raw) => { raw.nodes[1].estimatedHours = Infinity; },
    (raw) => { raw.nodes[1].exercises = []; },
    (raw) => { raw.nodes = raw.nodes.slice(0, 5); },
    (raw) => { raw.nodes.forEach((node) => { node.kind = "topic"; }); },
    (raw) => { raw.edges = raw.nodes.slice(1).map((node, i) => ({ source: `n${i}`, target: node.id })); },
  ]) {
    const raw = fixture();
    corrupt(raw);
    assert.throws(() => normalizeRoadmap(raw), (error) => error.status === 502);
  }
  normalized.nodes[0].completed = true;
  assert.deepEqual(roadmapProgress({ ...normalized, hoursPerWeek: 5 }), {
    completedCount: 1, totalNodes: 12, percentage: 8, totalHours: 24, estimatedWeeks: 5,
  });
});

test("Gemini generation requests structured output and handles refusal, quota, malformed JSON and timeouts", async () => {
  let call;
  const client = { models: { generateContent: async (options) => { call = options; return { text: JSON.stringify(fixture()) }; } } };
  const options = { client, retryDelayMs: 0 };
  const result = await generateLearningRoadmap({ skill: "Python", level: "beginner", hoursPerWeek: 5 }, options);
  assert.equal(result.nodes.length, 12);
  assert.equal(call.config.responseMimeType, "application/json");
  assert.deepEqual(call.config.responseJsonSchema.properties.nodes.items.properties.kind.enum, ["prerequisite", "topic", "practice", "project", "milestone"]);
  assert.match(call.config.systemInstruction, /never as instructions/);
  client.models.generateContent = async () => ({ text: "" });
  await assert.rejects(generateLearningRoadmap({}, options), (error) => error.status === 502);
  client.models.generateContent = async () => { throw { status: 429 }; };
  await assert.rejects(generateLearningRoadmap({}, options), (error) => error.status === 429);
  client.models.generateContent = async () => { throw new Error("a private provider error"); };
  await assert.rejects(generateLearningRoadmap({}, options), (error) => !error.message.includes("private provider"));
  client.models.generateContent = async () => { throw new Error("Request timed out"); };
  await assert.rejects(generateLearningRoadmap({}, options), (error) => error.status === 504);
  client.models.generateContent = () => new Promise(() => {});
  await assert.rejects(generateLearningRoadmap({}, { ...options, timeoutMs: 10 }), (error) => error.status === 504);
});

test("Gemini wire schema avoids costly nested bounds while server validation still limits generated content", () => {
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      assert.equal(["minItems", "maxItems", "minimum", "maximum"].includes(key), false, `${key} can exceed Gemini's constrained-decoder state limit`);
      visit(item);
    }
  };
  visit(roadmapResponseSchema);
  const oversized = fixture();
  oversized.nodes = Array.from({ length: 33 }, (_, index) => ({ ...oversized.nodes[0], id: `topic${index}` }));
  assert.throws(() => normalizeRoadmap(oversized), (error) => error.status === 502);
  const invalidTime = fixture();
  invalidTime.nodes[0].estimatedHours = 1000;
  assert.throws(() => normalizeRoadmap(invalidTime), (error) => error.status === 502);
});

test("busy, missing, rate-limited or malformed primary responses recover through a second Gemini model", async () => {
  for (const status of [404, 429, 500, 503, "malformed"]) {
    const calls = [];
    const client = { models: { generateContent: async (request) => {
      calls.push(request);
      if (request.model === "primary") {
        if (status === "malformed") return { text: "invalid json" };
        throw { status };
      }
      return { text: JSON.stringify(fixture()) };
    } } };
    const result = await generateLearningRoadmap({ skill: "Python" }, {
      client, model: "primary", fallbackModel: "backup", retryDelayMs: 0,
    });
    assert.equal(result.nodes.length, 12);
    assert.deepEqual(calls.map((call) => call.model), ["primary", "backup"]);
    assert.equal(calls[1].config.responseJsonSchema, calls[0].config.responseJsonSchema);
    assert.equal(calls[1].contents, calls[0].contents, "fallback receives the same learning preferences");
  }
});

test("a stalled primary is cancelled early, leaving the fallback time within the total deadline", async () => {
  const calls = [];
  let primarySignal;
  const client = { models: { generateContent: async (request) => {
    calls.push(request.model);
    if (request.model === "primary") { primarySignal = request.config.abortSignal; return new Promise(() => {}); }
    return { text: JSON.stringify(fixture()) };
  } } };
  const roadmap = await generateLearningRoadmap({}, { client, model: "primary", fallbackModel: "backup", primaryTimeoutMs: 10, timeoutMs: 1000, retryDelayMs: 0 });
  assert.equal(roadmap.nodes.length, 12);
  assert.equal(primarySignal.aborted, true);
  assert.deepEqual(calls, ["primary", "backup"]);
});

test("non-recoverable API errors do not retry; exhausted fallbacks remain bounded and safe", async () => {
  for (const status of [400, 401, 403, 503]) {
    const calls = [];
    const client = { models: { generateContent: async (request) => { calls.push(request.model); throw { status, message: "private provider details" }; } } };
    await assert.rejects(generateLearningRoadmap({}, { client, model: "primary", fallbackModel: "backup", retryDelayMs: 0 }), (error) => {
      assert.equal(error.message.includes("private provider details"), false);
      assert.equal(error.status, status === 400 ? 502 : 503);
      return true;
    });
    assert.equal(calls.length, status === 503 ? 2 : 1);
  }
  let calls = 0;
  const client = { models: { generateContent: async () => { calls++; throw { status: 503 }; } } };
  await assert.rejects(generateLearningRoadmap({}, { client, model: "same", fallbackModel: "same", retryDelayMs: 0 }), (error) => error.status === 503);
  assert.equal(calls, 1, "identical models are not requested twice");
});

test("Mongoose stores node details, completion and positions with appropriate field types", () => {
  const roadmap = new LearningRoadmap({ ...normalizeRoadmap(fixture()), userId: "user_test", skill: "Python", level: "beginner", hoursPerWeek: 5 });
  roadmap.nodes[0].position = { x: 123.5, y: -40 };
  roadmap.nodes[0].completed = true;
  assert.equal(roadmap.validateSync(), undefined);
  const restored = new LearningRoadmap(JSON.parse(JSON.stringify(roadmap)));
  assert.equal(restored.nodes[0].completed, true);
  assert.equal(restored.nodes[0].position.x, 123.5);
  assert.equal(restored.nodes[0].position.y, -40);
  assert.equal(restored.nodes[0].documentation[0].url, "https://docs.python.org/3/tutorial/");
});

test("generation limits are per user, prevent concurrent calls, and expire", () => {
  let time = 0;
  const limit = createGenerationLimit({ now: () => time });
  const req = { roadmapUserId: "user_a", body: { skill: "React" } };
  const response = () => ({ statusCode: 200, set() {}, status(code) { this.statusCode = code; return this; }, json(data) { this.data = data; } });
  let next = 0;
  limit(req, response(), () => next++);
  const concurrent = response();
  limit(req, concurrent, () => next++);
  assert.equal(concurrent.statusCode, 429);
  req.releaseGeneration();
  for (let i = 0; i < 4; i++) { limit(req, response(), () => next++); req.releaseGeneration(); }
  const exhausted = response();
  limit(req, exhausted, () => next++);
  assert.equal(exhausted.statusCode, 429);
  const other = { ...req, roadmapUserId: "user_b" };
  limit(other, response(), () => next++);
  other.releaseGeneration();
  time = 600001;
  limit(req, response(), () => next++);
  assert.equal(next, 7);
});

test("roadmap HTTP routes enforce ownership, persist progress and layout, and reopen saved paths", async (t) => {
  const originals = [];
  const stub = (key, fn) => { originals.push([key, LearningRoadmap[key]]); LearningRoadmap[key] = fn; };
  const store = [];
  let sequence = 1;
  let aiCalls = 0;
  const clone = (data) => structuredClone(data);
  const matching = (filter) => store.find((doc) => doc._id === filter._id && doc.userId === filter.userId && (!filter["nodes.id"] || doc.nodes.some((node) => node.id === filter["nodes.id"])));
  const query = (value) => {
    const q = { select: () => q, sort: () => q, limit: () => q, lean: async () => clone(value) };
    return q;
  };
  stub("create", async (fields) => {
    const doc = { ...clone(fields), _id: String(sequence++).padStart(24, "0") };
    store.push(doc);
    return clone(doc);
  });
  stub("find", (filter) => query(store.filter((doc) => doc.userId === filter.userId)));
  stub("findOne", (filter) => query(matching(filter) || null));
  stub("findOneAndUpdate", (filter, update) => {
    const doc = matching(filter);
    if (doc) doc.nodes.find((node) => node.id === filter["nodes.id"]).completed = update.$set["nodes.$.completed"];
    return query(doc || null);
  });
  stub("updateOne", async (filter, update, options) => {
    const doc = matching(filter);
    if (doc) options.arrayFilters.forEach((arrayFilter, index) => {
      const node = doc.nodes.find((item) => item.id === arrayFilter[`node${index}.id`]);
      node.position = update.$set[`nodes.$[node${index}].position`];
    });
    return { matchedCount: doc ? 1 : 0 };
  });
  const app = express();
  app.use(express.json());
  // Only this local test server maps a header to Clerk's verified auth shape.
  app.use((req, _res, next) => { req.auth = { userId: req.headers["x-test-user"] }; next(); });
  app.use("/api/roadmaps", createRoadmapRouter({ generate: async () => { aiCalls++; return normalizeRoadmap(fixture()); } }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    for (const [key, original] of originals.reverse()) LearningRoadmap[key] = original;
  });
  const call = async (path = "/", { method = "GET", body, user = "user_a" } = {}) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/roadmaps${path}`, {
      method, headers: { "Content-Type": "application/json", ...(user ? { "x-test-user": user } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, ...await response.json() };
  };
  assert.equal((await call("/generate", { method: "POST", user: null, body: { skill: "React" } })).status, 401);
  assert.equal(aiCalls, 0);
  assert.equal((await call("/generate", { method: "POST", body: { skill: " " } })).status, 400);
  assert.equal(aiCalls, 0);
  const created = await call("/generate", { method: "POST", body: { skill: "Python", userId: "user_b", nodes: [] } });
  assert.equal(created.status, 201);
  assert.equal(created.roadmap.userId, undefined, "owner is not exposed or accepted from the browser");
  assert.equal(store[0].userId, "user_a");
  assert.equal(created.roadmap.progress.percentage, 0);
  const id = created.roadmap._id;
  assert.equal((await call()).roadmaps.length, 1);
  assert.equal((await call("/", { user: "user_b" })).roadmaps.length, 0);
  assert.equal((await call(`/${id}`, { user: "user_b" })).status, 404);
  assert.equal((await call("/bad-id")).status, 400);
  assert.equal((await call(`/${id}/nodes/n0`, { method: "PATCH", body: { completed: "true" } })).status, 400);
  assert.equal((await call(`/${id}/nodes/absent`, { method: "PATCH", body: { completed: true } })).status, 404);
  assert.equal((await call(`/${id}/nodes/n0`, { method: "PATCH", body: { completed: true }, user: "user_b" })).status, 404);
  let result = await call(`/${id}/nodes/n0`, { method: "PATCH", body: { completed: true } });
  assert.equal(result.roadmap.progress.percentage, 8);
  result = await call(`/${id}/nodes/n0`, { method: "PATCH", body: { completed: true } });
  assert.equal(result.roadmap.progress.completedCount, 1, "retrying completion is idempotent");
  await Promise.all(["n1", "n2"].map((nodeId) => call(`/${id}/nodes/${nodeId}`, { method: "PATCH", body: { completed: true } })));
  assert.equal((await call(`/${id}`)).roadmap.progress.completedCount, 3, "updates to distinct nodes do not overwrite each other");
  const positions = [{ id: "n0", x: 225, y: -90 }, { id: "n1", x: 400, y: 200 }];
  assert.equal((await call(`/${id}/layout`, { method: "PATCH", user: "user_b", body: { positions } })).status, 404);
  for (const bad of [[], [{ id: "n0", x: "22", y: 1 }], [{ id: "n0", x: 1e9, y: 0 }], [positions[0], positions[0]]]) {
    assert.equal((await call(`/${id}/layout`, { method: "PATCH", body: { positions: bad } })).status, 400);
  }
  assert.equal((await call(`/${id}/layout`, { method: "PATCH", body: { positions: [{ id: "absent", x: 0, y: 0 }] } })).status, 404);
  assert.equal((await call(`/${id}/layout`, { method: "PATCH", body: { positions } })).status, 200);
  result = await call(`/${id}`);
  assert.deepEqual(result.roadmap.nodes[0].position, { x: 225, y: -90 });
  assert.equal(result.roadmap.nodes[0].completed, true);
  assert.equal((await call()).roadmaps[0].progress.completedCount, 3);
  result = await call(`/${id}/nodes/n0`, { method: "PATCH", body: { completed: false } });
  assert.equal(result.roadmap.progress.completedCount, 2);
  assert.equal((await call(`/${id}`)).roadmap.nodes[0].completed, false);
});
