// Decides which job seekers should get a "new job posted" email.
// A user is emailed only when the job fits their profile:
//   1. Their saved job alert preferences (roles/categories, skills, locations, levels), or
//   2. If they have not set any, the jobs they applied to or saved before.
// Users with neither (or who turned alerts off) are not emailed.
import { extractSkillsFromText, stripHtml } from "./skillMatcher.js";

export const PREFERENCE_GROUPS = ["roles", "skills", "locations", "levels"];
const MAX_ITEMS = 20;
const MAX_ITEM_LENGTH = 60;

const norm = (value) => String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Whole-word(ish) match so "Java" does not match "JavaScript".
const containsWord = (haystack, needle) => {
  const n = norm(needle);
  if (!n) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(n)}($|[^a-z0-9+#])`, "i").test(norm(haystack));
};

/** Validates preferences sent by the browser. Throws an Error with a readable message. */
export const normalizePreferences = (input = {}) => {
  if (typeof input !== "object" || input === null) throw new Error("Preferences must be an object.");
  const out = { emailAlerts: input.emailAlerts === undefined ? true : input.emailAlerts === true };
  for (const group of PREFERENCE_GROUPS) {
    const raw = input[group] ?? [];
    if (!Array.isArray(raw)) throw new Error(`${group} must be a list.`);
    const seen = new Set();
    out[group] = [];
    for (const item of raw) {
      if (typeof item !== "string") throw new Error(`${group} must contain text only.`);
      const clean = item.replace(/\s+/g, " ").trim();
      if (!clean) continue;
      if (clean.length > MAX_ITEM_LENGTH) throw new Error(`"${clean.slice(0, 20)}…" is too long (max ${MAX_ITEM_LENGTH} characters).`);
      if (seen.has(norm(clean))) continue;
      seen.add(norm(clean));
      out[group].push(clean);
    }
    if (out[group].length > MAX_ITEMS) throw new Error(`Please choose at most ${MAX_ITEMS} ${group}.`);
  }
  return out;
};

export const hasPreferences = (prefs) => PREFERENCE_GROUPS.some((g) => prefs?.[g]?.length);

const jobText = (job) => `${job.title || ""} ${job.category || ""} ${stripHtml(job.description || "")}`;

/** Match using the user's own preferences. Every group the user filled in must be satisfied. */
const matchPreferences = (job, prefs) => {
  const reasons = [];
  const text = jobText(job);

  const roles = prefs.roles || [];
  const skills = prefs.skills || [];
  if (roles.length || skills.length) {
    const roleHits = roles.filter(
      (r) => containsWord(job.category, r) || containsWord(job.title, r) || containsWord(r, job.category)
    );
    const jobSkills = extractSkillsFromText(text).map(norm);
    const skillHits = skills.filter((s) => jobSkills.includes(norm(s)) || containsWord(text, s));
    if (!roleHits.length && !skillHits.length) return { match: false, reasons: [] };
    reasons.push(...roleHits, ...skillHits);
  }

  if (prefs.locations?.length) {
    const hit = prefs.locations.find((l) => containsWord(job.location, l));
    const remote = containsWord(job.location, "remote") && prefs.locations.some((l) => containsWord(l, "remote"));
    if (!hit && !remote) return { match: false, reasons: [] };
    reasons.push(hit || "Remote");
  }

  if (prefs.levels?.length) {
    const hit = prefs.levels.find((l) => norm(l) === norm(job.level));
    if (!hit) return { match: false, reasons: [] };
    reasons.push(hit);
  }

  return { match: true, reasons: [...new Set(reasons)] };
};

/** Match using jobs the user applied to or saved (used only when no preferences are set). */
const matchHistory = (job, historyJobs) => {
  if (!historyJobs?.length) return { match: false, reasons: [] };
  const category = norm(job.category);
  if (category && historyJobs.some((h) => norm(h.category) === category)) {
    return { match: true, reasons: [job.category] };
  }
  const jobSkills = extractSkillsFromText(jobText(job));
  const pastSkills = new Set(historyJobs.flatMap((h) => extractSkillsFromText(jobText(h))));
  const shared = jobSkills.filter((s) => pastSkills.has(s));
  // Needs 2 shared skills (or the job's only skill) so one common word like "Git" isn't enough.
  if (shared.length >= Math.min(2, jobSkills.length) && shared.length > 0) {
    return { match: true, reasons: shared.slice(0, 4) };
  }
  return { match: false, reasons: [] };
};

/**
 * @returns {{ match: boolean, reasons: string[], basis: "preferences"|"activity"|"none"|"opted_out" }}
 */
export const matchJobToUser = (job, user, historyJobs = []) => {
  const prefs = user?.jobPreferences || {};
  if (prefs.emailAlerts === false) return { match: false, reasons: [], basis: "opted_out" };
  if (hasPreferences(prefs)) return { ...matchPreferences(job, prefs), basis: "preferences" };
  if (historyJobs.length) return { ...matchHistory(job, historyJobs), basis: "activity" };
  return { match: false, reasons: [], basis: "none" };
};
