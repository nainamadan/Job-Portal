// Reads a resume file (PDF, DOCX or TXT) and pulls out the details used by the website's forms.
// 1. The text is extracted from the file.
// 2. Simple rules find the obvious things (email, phone, links, headed sections, known skills).
// 3. If GEMINI_API_KEY is set, Gemini reads the text too and fills the rest; the rules are the backup.
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";
import { extractSkillsFromText } from "./skillMatcher.js";

// Same field names as the ATS Simulator "Build Your Resume" form.
export const RESUME_FIELDS = [
  "name", "email", "phone", "location", "linkedin", "github", "portfolio", "summary",
  "degree", "institution", "graduationYear", "grade", "skills", "projects", "experience",
  "certifications", "achievements", "languages",
];
const SHORT_FIELDS = new Set(["name", "email", "phone", "location", "linkedin", "github", "portfolio", "degree", "institution", "graduationYear", "grade", "languages"]);
const MAX_SHORT = 200;
const MAX_LONG = 4000;
const MAX_TEXT_FOR_AI = 15000;

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/* ---------------- 1. Text extraction ---------------- */

export const detectFileType = (file) => {
  const name = String(file?.originalname || "").toLowerCase();
  const type = String(file?.mimetype || "").toLowerCase();
  if (type === PDF || name.endsWith(".pdf")) return "pdf";
  if (type === DOCX || name.endsWith(".docx")) return "docx";
  if (type === "application/msword" || name.endsWith(".doc")) return "doc";
  if (type.startsWith("text/") || name.endsWith(".txt")) return "txt";
  return "unknown";
};

export const extractResumeText = async (file) => {
  const kind = detectFileType(file);
  if (kind === "pdf") {
    const parser = new PDFParse({ data: file.buffer });
    try {
      return (await parser.getText()).text || "";
    } finally {
      await parser.destroy().catch(() => {});
    }
  }
  if (kind === "docx") return (await mammoth.extractRawText({ buffer: file.buffer })).value || "";
  if (kind === "txt") return file.buffer.toString("utf8");
  if (kind === "doc") throw new Error("Old .doc files can't be read. Please save it as PDF or .docx and try again.");
  throw new Error("Please upload a PDF, Word (.docx) or text file.");
};

/* ---------------- 2. Rule-based reading ---------------- */

const clean = (s) => String(s ?? "").replace(/\u0000/g, "").replace(/[ \t]+/g, " ").trim();

const SECTION_HEADINGS = {
  summary: ["summary", "professional summary", "profile", "about me", "about", "objective", "career objective", "profile summary"],
  education: ["education", "academic details", "academics", "educational qualification", "educational qualifications", "qualifications"],
  skills: ["skills", "technical skills", "key skills", "core skills", "skill set", "skillset", "technologies", "tech stack", "core competencies"],
  projects: ["projects", "academic projects", "personal projects", "key projects"],
  experience: ["experience", "work experience", "professional experience", "employment", "employment history", "internship", "internships", "work history"],
  certifications: ["certifications", "certification", "certificates", "courses", "training", "trainings", "licenses & certifications", "professional qualifications and affiliations"],
  achievements: ["achievements", "awards", "accomplishments", "honors", "honours", "awards & achievements", "extracurricular activities"],
  languages: ["languages", "languages known", "language"],
};
const HEADING_LOOKUP = new Map(
  Object.entries(SECTION_HEADINGS).flatMap(([key, names]) => names.map((n) => [n, key]))
);
const headingKey = (line) => {
  const t = line.toLowerCase().replace(/[:\-–—|•*#]+$/g, "").replace(/^[•*#\s]+/, "").trim();
  return t.split(/\s+/).length <= 5 ? HEADING_LOOKUP.get(t) : undefined;
};

/** Splits the text into { header, summary, education, skills, ... } by section headings. */
export const splitSections = (text) => {
  const sections = { header: [] };
  let current = "header";
  for (const raw of String(text).split(/\r?\n/)) {
    const line = clean(raw);
    if (!line) continue;
    const key = headingKey(line);
    if (key) {
      current = key;
      sections[current] = sections[current] || [];
      continue;
    }
    (sections[current] = sections[current] || []).push(line);
  }
  return sections;
};

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}/g;
const LINK_RE = (host) => new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${host}\\/[A-Za-z0-9_\\-./]+`, "i");
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|in|io|dev|me|app|net|org|tech|site|xyz|co)(?:\/[^\s,)]*)?/gi;

const findPhone = (text) => {
  for (const m of String(text).match(PHONE_RE) || []) {
    const digits = m.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 13 && !/^(19|20)\d{2}(19|20)\d{2}$/.test(digits)) return clean(m);
  }
  return "";
};

const NOT_A_NAME = /resume|curriculum|vitae|\bcv\b|@|\d|http|www\.|linkedin|github|summary|profile|objective/i;
const findName = (headerLines) => {
  for (const line of headerLines.slice(0, 6)) {
    const candidate = line.split(/[|•,]/)[0].trim();
    const words = candidate.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && !NOT_A_NAME.test(candidate) && /^[A-Za-z][A-Za-z.' -]+$/.test(candidate)) {
      return candidate.replace(/\s+/g, " ");
    }
  }
  return "";
};

const CITIES = ["Delhi", "New Delhi", "Mumbai", "Bangalore", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Noida", "Gurugram", "Gurgaon", "Chandigarh", "Lucknow", "Indore", "Bhopal", "Kochi", "Coimbatore", "Nagpur", "Surat", "Vadodara", "Patna", "Bhubaneswar", "Dehradun", "Mohali", "Ghaziabad", "Faridabad", "Visakhapatnam", "Thiruvananthapuram", "Mysore", "Mysuru", "Ludhiana", "Amritsar", "Kanpur", "Remote"];
const findLocation = (headerLines) => {
  const top = headerLines.slice(0, 10);
  for (let i = 0; i < top.length; i++) {
    const city = CITIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(top[i]));
    if (!city) continue;
    const after = top[i].slice(top[i].toLowerCase().indexOf(city.toLowerCase()) + city.length);
    const state = after.match(/^\s*,\s*([A-Za-z ]{3,25})/)?.[1]?.trim() ||
      (top[i + 1] && /^[A-Za-z ]{3,25}$/.test(top[i + 1]) && !NOT_A_NAME.test(top[i + 1]) ? top[i + 1] : "");
    return state ? `${city}, ${state}` : city;
  }
  return "";
};

const DEGREE_RE = /\b(b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|bca|mca|b\.?\s?sc|m\.?\s?sc|b\.?\s?com|m\.?\s?com|bba|mba|b\.?\s?a\b|m\.?\s?a\b|ph\.?\s?d|bachelor|master|diploma|12th|10\+2|hsc|ssc)/i;
const SCHOOL_RE = /\b(university|college|institute|institution|school|iit|nit|iiit|academy|vidyalaya)\b/i;
const GRADE_RE = /(\d{1,2}(?:\.\d{1,2})?\s*(?:\/\s*10)?\s*(?:cgpa|gpa|sgpa))|((?:cgpa|gpa)\s*[:\-]?\s*\d{1,2}(?:\.\d{1,2})?)|(\d{2,3}(?:\.\d{1,2})?\s*%)/i;

const readEducation = (lines = []) => {
  const block = lines.slice(0, 12);
  const degree = block.find((l) => DEGREE_RE.test(l)) || "";
  const institution = block.find((l) => SCHOOL_RE.test(l) && l !== degree) || "";
  const years = (block.join(" ").match(/\b(19|20)\d{2}\b/g) || []).map(Number);
  const grade = block.join(" ").match(GRADE_RE)?.[0] || "";
  return {
    degree: clean(degree.replace(/\s*(graduated|passed|completed)?,?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*(19|20)\d{2}.*$/i, "")),
    institution: clean(institution.replace(/\s*(marks|cgpa|gpa|grade)\b.*$/i, "")),
    graduationYear: years.length ? String(Math.max(...years)) : "",
    grade: clean(grade),
  };
};

const joinBlock = (lines) => (lines?.length ? lines.join("\n") : "");
const asList = (lines) =>
  (lines || []).join(", ").split(/\s*[,•|·;]\s*|\s{2,}/).map((s) => s.replace(/^[-*]\s*/, "").trim()).filter((s) => s && s.length < 60);

/** Rule-based details from plain resume text. Never throws; missing things come back as "". */
export const parseResumeText = (text) => {
  const sections = splitSections(text);
  const header = sections.header || [];
  const all = String(text);
  // Remove email addresses first so "name@example.com" isn't mistaken for a website.
  const withoutEmails = all.replace(new RegExp(EMAIL_RE.source, "g"), " ");
  const links = (withoutEmails.match(URL_RE) || []).map((u) => u.replace(/[.,;]+$/, ""));
  const skillsFromSection = asList(sections.skills);
  const skills = skillsFromSection.length ? skillsFromSection : extractSkillsFromText(all);
  const languages = sections.languages ? asList(sections.languages).join(", ")
    : (all.match(/languages?\s*(?:known)?\s*[:\-]\s*([A-Za-z ,]+)/i)?.[1] || "");

  return {
    name: findName(header),
    email: all.match(EMAIL_RE)?.[0] || "",
    phone: findPhone(all),
    location: findLocation(header),
    linkedin: all.match(LINK_RE("linkedin\\.com"))?.[0] || "",
    github: all.match(LINK_RE("github\\.com"))?.[0] || "",
    portfolio: links.find((u) => !/linkedin\.com|github\.com|gmail\.com|outlook\.com|yahoo\.com/i.test(u) && !EMAIL_RE.test(u)) || "",
    summary: joinBlock(sections.summary),
    ...readEducation(sections.education),
    skills: [...new Set(skills)].join(", "),
    projects: joinBlock(sections.projects),
    experience: joinBlock(sections.experience),
    certifications: joinBlock(sections.certifications),
    achievements: joinBlock(sections.achievements),
    languages: clean(languages),
  };
};

/* ---------------- 3. AI reading (optional) ---------------- */

const AI_MODEL = process.env.GEMINI_RESUME_MODEL || "gemini-3.8-flash";
const AI_TIMEOUT_MS = 12000;
// After the AI fails or times out, skip it for a while so people aren't kept waiting each time.
const AI_COOLDOWN_MS = 5 * 60 * 1000;
let aiUnavailableUntil = 0;
export const resetAICooldown = () => { aiUnavailableUntil = 0; };

const aiPrompt = (text) => `Extract details from this resume. Reply with ONLY a JSON object with exactly these string keys:
${RESUME_FIELDS.join(", ")}.
Rules: use "" when something is not in the resume (never invent anything). "skills" and "languages" are comma-separated lists.
"projects", "experience", "certifications" and "achievements" keep the resume's own wording, one item per line, bullets as "- ".
"degree", "institution", "graduationYear" and "grade" are for the highest/most recent degree. "location" is "City, State" if present.
"linkedin", "github" and "portfolio" are URLs exactly as written.

RESUME:
"""
${text.slice(0, MAX_TEXT_FOR_AI)}
"""`;

export const parseWithAI = async (text, { client } = {}) => {
  if (!client && !process.env.GEMINI_API_KEY) return null;
  const ai = client || new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("AI timed out")), AI_TIMEOUT_MS); });
  try {
    const response = await Promise.race([
      ai.models.generateContent({ model: AI_MODEL, contents: aiPrompt(text), config: { responseMimeType: "application/json", temperature: 0 } }),
      timeout,
    ]);
    const raw = String(response?.text || "").trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
    const data = JSON.parse(raw);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } finally {
    clearTimeout(timer);
  }
};

/* ---------------- Combine + tidy ---------------- */

const tidy = (key, value) => {
  let v = Array.isArray(value) ? value.join(key === "skills" || key === "languages" ? ", " : "\n") : value;
  if (typeof v !== "string") v = v == null ? "" : String(v);
  v = v.replace(/\u0000/g, "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (["n/a", "na", "none", "null", "not mentioned", "not available", "-"].includes(v.toLowerCase())) v = "";
  if (key === "email" && v && !EMAIL_RE.test(v)) v = "";
  if (key === "graduationYear") v = v.match(/\b(19|20)\d{2}\b/)?.[0] || "";
  return v.slice(0, SHORT_FIELDS.has(key) ? MAX_SHORT : MAX_LONG);
};

// Exact things (email, phone, links) trust the rules first; everything else trusts the AI first.
const RULES_FIRST = new Set(["email", "phone", "linkedin", "github"]);

export const mergeDetails = (rules = {}, ai = null) => {
  const details = {};
  for (const key of RESUME_FIELDS) {
    const r = tidy(key, rules[key]);
    const a = ai ? tidy(key, ai[key]) : "";
    details[key] = RULES_FIRST.has(key) ? r || a : a || r;
  }
  return details;
};

/** Full pipeline for an uploaded file. */
export const parseResumeFile = async (file, options = {}) => {
  const text = await extractResumeText(file);
  if (text.replace(/\s/g, "").length < 30) {
    throw new Error("No readable text was found in this file. If it's a scanned image, please upload a text-based PDF or .docx.");
  }
  const rules = parseResumeText(text);
  let ai = null;
  let source = "rules";
  if (options.client || Date.now() >= aiUnavailableUntil) {
    try {
      ai = await parseWithAI(text, options);
      if (ai) source = "ai";
    } catch (error) {
      aiUnavailableUntil = Date.now() + AI_COOLDOWN_MS;
      console.warn("AI resume reading failed, using rules only for the next 5 minutes:", error.message);
    }
  }
  const details = mergeDetails(rules, ai);
  const filled = RESUME_FIELDS.filter((k) => details[k]);
  return { details, filled, source };
};
