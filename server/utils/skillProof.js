// Authored practical tasks. No candidate code is executed on the server.
export const SKILL_CHALLENGES = [
  {
    id: "react-search", skill: "React", title: "Build a searchable job board", level: "Intermediate", duration: "2–4 hours",
    brief: "Build a responsive job list that loads data, searches by title and filters by location.",
    criteria: ["Search and location filters work together", "Loading, empty and failed requests have clear states", "Filters and results work with a keyboard and on mobile", "Include tests and a README explaining your component choices"],
  },
  {
    id: "javascript-data", skill: "JavaScript", title: "Turn messy data into useful results", level: "Foundational", duration: "1–2 hours",
    brief: "Write a function that deduplicates job records, validates salaries and returns a filtered, sorted result without changing its input.",
    criteria: ["Handle missing fields and duplicate IDs", "Combine title and salary filters correctly", "Keep the original data unchanged", "Add tests for empty input, bad salaries and range boundaries"],
  },
  {
    id: "node-api", skill: "Node.js", title: "Build a protected task API", level: "Intermediate", duration: "3–5 hours",
    brief: "Create a REST API where signed-in users can create, list, update and delete their own tasks.",
    criteria: ["Validate request data and return useful HTTP errors", "Users cannot read or change someone else's tasks", "Persist tasks in a database", "Include API tests for sign-in, ownership and invalid input"],
  },
  {
    id: "python-pipeline", skill: "Python", title: "Create a resilient CSV pipeline", level: "Intermediate", duration: "2–3 hours",
    brief: "Build a command-line tool that reads sales CSV files and produces a monthly revenue report.",
    criteria: ["Validate dates, amounts and required columns", "Report rejected rows without losing valid rows", "Calculate monthly totals and export a summary", "Include sample data, automated tests and run instructions"],
  },
  {
    id: "sql-analysis", skill: "SQL", title: "Answer questions with real queries", level: "Intermediate", duration: "1–3 hours",
    brief: "Create a small orders database and write queries for monthly revenue, repeat customers and the top three products in each category.",
    criteria: ["Provide schema and reproducible seed data", "Handle cancelled orders, ties and customers with no orders", "Use joins, grouping and a window function", "Explain an index choice and include expected query results"],
  },
];

export class ProofInputError extends Error {}
const textField = (value, name, min, max) => {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new ProofInputError(`${name} must contain ${min}–${max} characters.`);
  }
  return value.trim();
};

export const evidenceUrl = (value, name, required = false) => {
  if (!required && (value === undefined || value === "")) return "";
  const input = textField(value, name, 8, 1500);
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") ||
        /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) throw new Error();
    return url.href;
  } catch { throw new ProofInputError(`${name} must be a public HTTPS link without a username or password.`); }
};

export const validateProof = (body) => {
  if (!body || typeof body !== "object") throw new ProofInputError("Add your project evidence first.");
  if (!Array.isArray(body.skills) || !body.skills.length || body.skills.length > 8) throw new ProofInputError("Choose between 1 and 8 skills.");
  const skills = body.skills.map((skill) => textField(skill, "Each skill", 1, 40));
  if (new Set(skills.map((skill) => skill.toLowerCase())).size !== skills.length) throw new ProofInputError("Remove repeated skills.");
  const challengeId = body.challengeId === undefined ? "" : body.challengeId;
  if (typeof challengeId !== "string") throw new ProofInputError("Choose a valid challenge or your own project.");
  const challenge = SKILL_CHALLENGES.find((item) => item.id === challengeId);
  if (challengeId && !challenge) throw new ProofInputError("This challenge does not exist.");
  if (challenge && !skills.some((skill) => skill.toLowerCase() === challenge.skill.toLowerCase())) throw new ProofInputError(`Include ${challenge.skill} in the skills for this challenge.`);
  // Explicit fields prevent ownership, approval or version values being supplied by a candidate.
  return {
    title: textField(body.title, "Project title", 5, 120), skills, challengeId,
    summary: textField(body.summary, "What you built", 40, 3000),
    contribution: textField(body.contribution, "Your contribution and technical decisions", 40, 3000),
    sourceUrl: evidenceUrl(body.sourceUrl, "Source code link", true),
    demoUrl: evidenceUrl(body.demoUrl, "Demo link"),
    writeupUrl: evidenceUrl(body.writeupUrl, "Walkthrough link"),
  };
};

export const validateReview = (body) => {
  if (body?.reviewedEvidence !== true) throw new ProofInputError("Confirm that you inspected this version’s evidence before reviewing it.");
  if (!["approved", "needs_work"].includes(body?.status)) throw new ProofInputError("Choose approve or request improvements.");
  return { status: body.status, note: textField(body.note, "Review feedback", 10, 1500) };
};

export const validRevision = (value) => Number.isSafeInteger(value) && value >= 1;

export const presentProof = (doc, companyId) => {
  const proof = doc.toObject ? doc.toObject() : doc;
  const { userId, __v, ...visible } = proof;
  void userId; void __v;
  // Recruiters see only their own company's feedback. Candidates see all their reviews.
  visible.reviews = (proof.reviews || []).filter((review) => !companyId || String(review.companyId) === String(companyId));
  visible.challenge = SKILL_CHALLENGES.find((item) => item.id === proof.challengeId) || null;
  return visible;
};
