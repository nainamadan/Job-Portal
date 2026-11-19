import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { detectFileType, extractResumeText, mergeDetails, parseResumeFile, parseResumeText, parseWithAI, RESUME_FIELDS } from "../utils/resumeParser.js";
import resumeRoutes from "../routes/resumeRoutes.js";

const SAMPLE = `Priya Sharma
Pune, Maharashtra | +91 98765 43210 | priya.sharma@example.com
linkedin.com/in/priya-sharma | github.com/priyacodes | https://priya.dev

Profile Summary
Frontend developer who builds fast, accessible React apps.

Education
B.Tech in Computer Science
ABC Institute of Technology, Pune
2020 - 2024 | CGPA: 8.7

Technical Skills
React, JavaScript, Node.js, MongoDB, Tailwind CSS

Projects
Job Portal – MERN
- Built search and filters for 1,000+ jobs.

Experience
Frontend Intern, Acme Corp (Jan 2024 - Jun 2024)
- Shipped 12 UI features.

Certifications
AWS Cloud Practitioner

Languages
English, Hindi, Marathi
`;

test("rules read the common parts of a resume", () => {
  const d = parseResumeText(SAMPLE);
  assert.equal(d.name, "Priya Sharma");
  assert.equal(d.email, "priya.sharma@example.com");
  assert.equal(d.phone.replace(/\D/g, "").slice(-10), "9876543210");
  assert.equal(d.location, "Pune, Maharashtra");
  assert.equal(d.linkedin, "linkedin.com/in/priya-sharma");
  assert.equal(d.github, "github.com/priyacodes");
  assert.equal(d.portfolio, "https://priya.dev");
  assert.match(d.summary, /accessible React apps/);
  assert.equal(d.degree, "B.Tech in Computer Science");
  assert.equal(d.institution, "ABC Institute of Technology, Pune");
  assert.equal(d.graduationYear, "2024");
  assert.match(d.grade, /8\.7/);
  assert.equal(d.skills, "React, JavaScript, Node.js, MongoDB, Tailwind CSS");
  assert.match(d.projects, /^Job Portal/);
  assert.match(d.experience, /Frontend Intern, Acme Corp/);
  assert.equal(d.certifications, "AWS Cloud Practitioner");
  assert.equal(d.languages, "English, Hindi, Marathi");
});

test("AI answers fill gaps; exact contact details still come from the text", async () => {
  const rules = parseResumeText("Asha Rao\nasha@example.com\n+91 91234 56789\nSkills\nPython");
  const fakeAI = { models: { generateContent: async () => ({ text: JSON.stringify({
    name: "Asha Rao", email: "wrong@example.com", phone: "", location: "Delhi, Delhi", skills: ["Python", "SQL"],
    summary: "N/A", graduationYear: "Class of 2025", experience: ["Data intern", "- Built dashboards"],
  }) }) } };
  const ai = await parseWithAI("resume text", { client: fakeAI });
  const d = mergeDetails(rules, ai);
  assert.equal(d.email, "asha@example.com", "email trusted from the text");
  assert.equal(d.phone, "+91 91234 56789");
  assert.equal(d.location, "Delhi, Delhi", "AI fills what rules missed");
  assert.equal(d.skills, "Python, SQL");
  assert.equal(d.summary, "", '"N/A" is treated as empty');
  assert.equal(d.graduationYear, "2025");
  assert.equal(d.experience, "Data intern\n- Built dashboards");
  assert.deepEqual(Object.keys(d), RESUME_FIELDS);

  // A broken AI reply falls back to the rules.
  const brokenAI = { models: { generateContent: async () => ({ text: "not json" }) } };
  await assert.rejects(parseWithAI("x", { client: brokenAI }));
  const viaPipeline = await parseResumeFile({ originalname: "a.txt", mimetype: "text/plain", buffer: Buffer.from(SAMPLE) }, { client: brokenAI });
  assert.equal(viaPipeline.source, "rules");
  assert.equal(viaPipeline.details.name, "Priya Sharma");

  // A working AI is used when present.
  const viaAI = await parseResumeFile({ originalname: "a.txt", mimetype: "text/plain", buffer: Buffer.from(SAMPLE) }, { client: fakeAI });
  assert.equal(viaAI.source, "ai");
  assert.equal(viaAI.details.email, "priya.sharma@example.com", "email still from the text");
});

test("real PDF, file types and unreadable files", async () => {
  const pdf = { buffer: fs.readFileSync(path.join(import.meta.dirname, "../../client/src/assets/sample-corporate-resume.pdf")), originalname: "cv.pdf", mimetype: "application/pdf" };
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY; // rules only, no network
  try {
    const result = await parseResumeFile(pdf);
    assert.equal(result.source, "rules");
    assert.equal(result.details.name, "Ram Kumar");
    assert.equal(result.details.location, "Mumbai, Maharashtra");
    assert.equal(result.details.institution, "Symbiosis Institute of Management Studies");
    assert.ok(result.filled.includes("email"));

    assert.equal(detectFileType({ originalname: "a.DOCX" }), "docx");
    assert.equal(detectFileType({ originalname: "a.doc" }), "doc");
    assert.equal(detectFileType({ originalname: "a.png", mimetype: "image/png" }), "unknown");
    await assert.rejects(extractResumeText({ originalname: "a.doc", buffer: Buffer.from("x") }), /\.doc files can't be read/);
    await assert.rejects(parseResumeFile({ originalname: "a.txt", mimetype: "text/plain", buffer: Buffer.from("   ") }), /No readable text/);
    const txt = await parseResumeFile({ originalname: "a.txt", mimetype: "text/plain", buffer: Buffer.from(SAMPLE) });
    assert.equal(txt.details.email, "priya.sharma@example.com");
  } finally {
    if (saved !== undefined) process.env.GEMINI_API_KEY = saved;
  }
});

test("upload endpoint", async (t) => {
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const server = express().use("/api/resume", resumeRoutes).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(async () => { await new Promise((r) => server.close(r)); if (saved !== undefined) process.env.GEMINI_API_KEY = saved; });
  const url = `http://127.0.0.1:${server.address().port}/api/resume/parse`;
  const send = (name, type, body) => { const f = new FormData(); f.append("resume", new Blob([body], { type }), name); return fetch(url, { method: "POST", body: f }); };

  let res = await send("cv.txt", "text/plain", SAMPLE);
  let data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.details.name, "Priya Sharma");

  res = await send("photo.png", "image/png", "abc");
  assert.equal(res.status, 400);
  res = await fetch(url, { method: "POST" });
  assert.equal(res.status, 400, "no file");
  res = await send("big.txt", "text/plain", "x".repeat(5 * 1024 * 1024 + 10));
  data = await res.json();
  assert.equal(res.status, 400);
  assert.match(data.message, /under 5MB/);
});
