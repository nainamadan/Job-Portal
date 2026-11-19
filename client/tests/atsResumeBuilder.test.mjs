// Run from client/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAtsResume, jobKeywords } from "../src/utils/atsResumeBuilder.js";

// Small stand-in for the page's parseResume: first line = name, contact lines, UPPERCASE headings.
const HEADINGS = {
  "PROFESSIONAL SUMMARY": "Professional Summary", "TECHNICAL SKILLS": "Technical Skills", "SKILLS": "Technical Skills",
  "WORK EXPERIENCE": "Work Experience", PROJECTS: "Projects", EDUCATION: "Education",
  CERTIFICATIONS: "Certifications", ACHIEVEMENTS: "Achievements", LANGUAGES: "Languages",
};
const parse = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const out = { name: lines[0], contact: [], sections: [] };
  let cur = null;
  for (const line of lines.slice(1)) {
    if (HEADINGS[line]) { cur = { title: HEADINGS[line], content: [] }; out.sections.push(cur); }
    else if (!cur) out.contact.push(line);
    else cur.content.push(line);
  }
  return out;
};

const RESUME = `Asha Rao
Email: asha@example.com
Phone: 9876543210
SKILLS
Python, SQL, React, Excel, react
PROJECTS
Sales Dashboard
Technologies: Excel
• made monthly charts.
Movie App
Technologies: React
- built search page;
EDUCATION
B.Sc Computer Science
ABC College
WORK EXPERIENCE
Intern, Acme (2024)
* fixed UI bugs
Trainee, Beta (2023)
- wrote reports`;

test("builds a clean, job-focused resume from only the person's own content", () => {
  const out = buildAtsResume({ resumeText: RESUME, parse, jobTitle: "Frontend Developer", detectedSkills: ["React"] });
  const lines = out.split("\n");
  assert.equal(lines[0], "Asha Rao");
  assert.equal(lines[2], "asha@example.com | 9876543210", "contact on one line, labels removed");

  // Summary written only from their degree + skills.
  assert.match(out, /PROFESSIONAL SUMMARY\nB\.Sc Computer Science graduate skilled in React, Python, SQL, Excel, seeking a Frontend Developer role\./);
  // Matching skill first, duplicates removed, nothing added.
  assert.match(out, /TECHNICAL SKILLS\nReact, Python, SQL, Excel\n/);
  // Relevant project first; bullets tidied.
  assert.ok(out.indexOf("Movie App") < out.indexOf("Sales Dashboard"));
  assert.match(out, /- Built search page\n/);
  assert.match(out, /- Made monthly charts/);
  // Work experience keeps its original (date) order.
  assert.ok(out.indexOf("Intern, Acme") < out.indexOf("Trainee, Beta"));
  // Standard ATS section order.
  const order = ["PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "WORK EXPERIENCE", "PROJECTS", "EDUCATION"].map((h) => out.indexOf(h));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.ok(!/undefined|null/.test(out));
});

test("keeps an existing summary and skips empty sections", () => {
  const out = buildAtsResume({
    resumeText: "Ravi K\nravi@example.com\nPROFESSIONAL SUMMARY\nanalyst who loves data.\nSKILLS\nSQL",
    parse,
    jobTitle: "Data Analyst",
  });
  assert.match(out, /PROFESSIONAL SUMMARY\nAnalyst who loves data\./);
  assert.ok(!out.includes("PROJECTS"));
  assert.ok(!out.includes("EDUCATION"));
});

test("job keywords come from matched skills and the job title", () => {
  assert.deepEqual(jobKeywords({ jobTitle: "Senior Frontend Developer", detectedSkills: ["React"] }), ["React", "frontend", "developer"]);
});

test("is fast", () => {
  const big = RESUME + "\n" + Array.from({ length: 200 }, (_, i) => `- point ${i}`).join("\n");
  const t = performance.now();
  for (let i = 0; i < 50; i++) buildAtsResume({ resumeText: big, parse, jobTitle: "Developer", detectedSkills: ["React"] });
  assert.ok((performance.now() - t) / 50 < 50, "under 50 ms per resume");
});
