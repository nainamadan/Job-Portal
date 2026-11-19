// Builds an ATS-friendly resume instantly in the browser (no AI, no waiting).
// It only re-organises and tidies what the person wrote: it never adds skills,
// jobs, numbers or achievements that are not already in their resume.
//
// What it does:
// - single column, plain text, standard UPPERCASE headings that applicant tracking systems recognise
// - name on top, contact details on one line
// - skills that match the target job are listed first
// - projects that match the job are listed first (work experience keeps its original order)
// - bullet points are made consistent ("- " + capital letter, no trailing full stop)
// - a short summary is written from the person's own degree and skills if they had none

const ORDER = [
  "Professional Summary",
  "Technical Skills",
  "Work Experience",
  "Projects",
  "Education",
  "Certifications",
  "Achievements",
  "Languages",
  "Additional Information",
];

const BULLET_RE = /^\s*(?:[-*•●▪◦‣–—>]|\d+[.)])\s+/;
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
const capitalise = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mentions = (text, keyword) => {
  const k = norm(keyword);
  return !!k && new RegExp(`(^|[^a-z0-9])${escapeRe(k)}($|[^a-z0-9+#])`, "i").test(norm(text));
};

/** Keywords that describe the target job: the matched skills plus meaningful words from the title. */
export const jobKeywords = ({ jobTitle = "", detectedSkills = [] }) => {
  const titleWords = norm(jobTitle)
    .split(" ")
    .filter((w) => w.length > 2 && !["and", "the", "for", "with", "senior", "junior", "lead", "intern"].includes(w));
  return [...new Set([...detectedSkills.map(String), ...titleWords])].filter(Boolean);
};

const relevance = (text, keywords) => keywords.reduce((n, k) => n + (mentions(text, k) ? 1 : 0), 0);

// Stable sort: most relevant first, otherwise keep the person's own order.
const byRelevance = (items, keywords, textOf = (x) => x) =>
  items
    .map((item, i) => ({ item, i, score: relevance(textOf(item), keywords) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.item);

const tidyBullet = (line) => `- ${capitalise(line.replace(BULLET_RE, "").trim()).replace(/[.;]+$/, "")}`;

/** Splits lines into entries: a title line followed by its bullet lines. */
const toEntries = (lines) => {
  const entries = [];
  let current = null;
  for (const line of lines) {
    if (BULLET_RE.test(line)) {
      if (!current) {
        current = { title: "", details: [], bullets: [] };
        entries.push(current);
      }
      current.bullets.push(tidyBullet(line));
    } else if (current && !current.bullets.length) {
      // Plain lines before any bullet belong to the same entry (e.g. title, then "Technologies: …").
      current.details.push(line.trim());
    } else {
      // A plain line after bullets (or the very first line) starts a new entry.
      current = { title: line.trim(), details: [], bullets: [] };
      entries.push(current);
    }
  }
  return entries;
};

const entryText = (e) => [e.title, ...e.details, ...e.bullets].join(" ");
const renderEntries = (entries) =>
  entries.map((e) => [e.title, ...e.details, ...e.bullets].filter(Boolean).join("\n")).join("\n\n");

const splitSkills = (lines) => {
  const out = [];
  const seen = new Set();
  for (const line of lines) {
    for (const raw of line.replace(BULLET_RE, "").split(/\s*[,|;•·]\s*/)) {
      const skill = raw.trim().replace(/\.$/, "");
      const key = skill.toLowerCase();
      if (skill && skill.length <= 60 && !seen.has(key)) {
        seen.add(key);
        out.push(skill);
      }
    }
  }
  return out;
};

const buildSkills = (lines, keywords) => {
  // Grouped skills ("Frontend: React, HTML") keep their groups; the groups that match the job come first.
  if (lines.filter((l) => /^[^:]{2,30}:\s*\S/.test(l.replace(BULLET_RE, ""))).length >= 2) {
    return byRelevance(lines.map((l) => l.replace(BULLET_RE, "").trim()), keywords).join("\n");
  }
  const skills = splitSkills(lines);
  return byRelevance(skills, keywords).join(", ");
};

const cleanContact = (contact) =>
  [...new Set(
    contact
      .flatMap((c) => c.split(/\s*[|•·]\s*/))
      .map((c) => c.replace(/^(email|e-mail|phone|mobile|location|linkedin|github|portfolio|website)\s*:\s*/i, "").trim())
      .filter(Boolean)
  )].join(" | ");

const writeSummary = ({ existing, education, skills, jobTitle, keywords }) => {
  if (existing.length) {
    const text = existing.map((l) => l.replace(BULLET_RE, "").trim()).join(" ").replace(/\s+/g, " ").trim();
    return capitalise(text);
  }
  // Only facts already in the resume: their degree and their own top skills.
  const degree = (education[0] || "").replace(/^(degree|qualification)\s*:\s*/i, "").trim();
  const topSkills = byRelevance(splitSkills(skills), keywords).slice(0, 5);
  if (!degree && !topSkills.length) return "";
  const parts = [];
  parts.push(degree ? `${degree} graduate` : "Candidate");
  if (topSkills.length) parts.push(`skilled in ${topSkills.join(", ")}`);
  let sentence = parts.join(" ");
  if (jobTitle) sentence += `, seeking a ${jobTitle.trim()} role`;
  return `${sentence}.`;
};

/**
 * @param {object} args
 * @param {string} args.resumeText - the person's resume text
 * @param {(text:string)=>{name:string, contact:string[], sections:{title:string, content:string[]}[]}} args.parse
 * @param {string} [args.jobTitle]
 * @param {string[]} [args.detectedSkills] - skills from the ATS scan that match the job
 * @returns {string} the ATS-friendly resume as plain text
 */
export const buildAtsResume = ({ resumeText, parse, jobTitle = "", detectedSkills = [] }) => {
  const parsed = parse(resumeText);
  const keywords = jobKeywords({ jobTitle, detectedSkills });

  const sections = new Map();
  for (const s of parsed.sections) {
    const list = sections.get(s.title) || [];
    sections.set(s.title, list.concat(s.content));
  }
  const get = (title) => sections.get(title) || [];

  const out = {
    "Professional Summary": writeSummary({
      existing: get("Professional Summary"),
      education: get("Education"),
      skills: get("Technical Skills"),
      jobTitle,
      keywords,
    }),
    "Technical Skills": get("Technical Skills").length ? buildSkills(get("Technical Skills"), keywords) : "",
    "Work Experience": renderEntries(toEntries(get("Work Experience"))), // keeps the original (date) order
    Projects: renderEntries(byRelevance(toEntries(get("Projects")), keywords, entryText)),
    Education: get("Education").map((l) => l.replace(BULLET_RE, "").trim()).join("\n"),
    Certifications: get("Certifications").map(tidyBullet).join("\n"),
    Achievements: get("Achievements").map(tidyBullet).join("\n"),
    Languages: splitSkills(get("Languages")).join(", "),
    "Additional Information": get("Additional Information").map(tidyBullet).join("\n"),
  };

  const blocks = [
    (parsed.name || "").trim(),
    cleanContact(parsed.contact || []),
    ...ORDER.filter((title) => out[title] && out[title].trim()).map((title) => `${title.toUpperCase()}\n${out[title].trim()}`),
  ];
  return blocks.filter(Boolean).join("\n\n");
};
