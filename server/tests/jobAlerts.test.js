import { test } from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import { matchJobToUser, normalizePreferences } from "../utils/jobAlertMatcher.js";
import { notifyMatchingUsers } from "../utils/jobAlerts.js";

const reactJob = {
  _id: "507f1f77bcf86cd799439101",
  title: "Frontend Developer",
  category: "Programming",
  location: "Bangalore",
  level: "1-3 Years",
  description: "<p>Build UIs with React, JavaScript and TailwindCSS.</p>",
};
const user = (jobPreferences) => ({ _id: "u", email: "u@example.test", jobPreferences });

test("preferences decide who matches", () => {
  assert.equal(matchJobToUser(reactJob, user({ roles: ["Programming"] })).match, true, "category");
  assert.equal(matchJobToUser(reactJob, user({ roles: ["frontend developer"] })).match, true, "title, any case");
  assert.equal(matchJobToUser(reactJob, user({ skills: ["React"] })).match, true, "skill in description");
  assert.equal(matchJobToUser(reactJob, user({ skills: ["Java"] })).match, false, "Java must not match JavaScript");
  assert.equal(matchJobToUser(reactJob, user({ roles: ["Marketing"] })).match, false, "different field");

  // Every group the user filled in must fit.
  assert.equal(matchJobToUser(reactJob, user({ skills: ["React"], locations: ["Bangalore"] })).match, true);
  assert.equal(matchJobToUser(reactJob, user({ skills: ["React"], locations: ["Mumbai"] })).match, false, "wrong city");
  assert.equal(matchJobToUser(reactJob, user({ skills: ["React"], levels: ["5+ Years"] })).match, false, "wrong level");
  assert.equal(matchJobToUser({ ...reactJob, location: "Remote" }, user({ skills: ["React"], locations: ["Remote"] })).match, true);

  const r = matchJobToUser(reactJob, user({ roles: ["Programming"], skills: ["React", "Python"], locations: ["Bangalore"] }));
  assert.deepEqual(r.reasons, ["Programming", "React", "Bangalore"]);
  assert.equal(r.basis, "preferences");

  // Opted out, or nothing to go on => no email.
  assert.equal(matchJobToUser(reactJob, user({ emailAlerts: false, skills: ["React"] })).basis, "opted_out");
  assert.equal(matchJobToUser(reactJob, user({})).match, false);
  assert.equal(matchJobToUser(reactJob, user(undefined)).basis, "none");
});

test("activity is used when no preferences are set", () => {
  const sameCategory = [{ title: "Backend Engineer", category: "programming", description: "Node.js" }];
  assert.equal(matchJobToUser(reactJob, user({}), sameCategory).match, true);
  const sharedSkills = [{ title: "UI Engineer", category: "Design", description: "React and JavaScript" }];
  assert.equal(matchJobToUser(reactJob, user({}), sharedSkills).match, true);
  const unrelated = [{ title: "Accountant", category: "Finance", description: "Excel, Taxation" }];
  assert.equal(matchJobToUser(reactJob, user({}), unrelated).match, false);
  // Saved preferences take priority over activity.
  assert.equal(matchJobToUser(reactJob, user({ roles: ["Marketing"] }), sameCategory).match, false);
});

test("preference input is validated", () => {
  const p = normalizePreferences({ roles: [" Programming ", "programming", ""], skills: ["React"], emailAlerts: false });
  assert.deepEqual(p.roles, ["Programming"]);
  assert.equal(p.emailAlerts, false);
  assert.deepEqual(p.levels, []);
  assert.throws(() => normalizePreferences({ skills: "React" }), /must be a list/);
  assert.throws(() => normalizePreferences({ skills: [42] }), /text only/);
  assert.throws(() => normalizePreferences({ skills: ["x".repeat(61)] }), /too long/);
  assert.throws(() => normalizePreferences({ skills: Array.from({ length: 21 }, (_, i) => `s${i}`) }), /at most 20/);
});

test("new job email goes only to matching users", async (t) => {
  const originals = [[User, "find", User.find], [Job, "find", Job.find], [JobApplication, "find", JobApplication.find]];
  t.after(() => { for (const [o, k, v] of originals) o[k] = v; });
  const lean = (v) => ({ lean: async () => v });
  const pastDesignJob = { _id: "507f1f77bcf86cd799439201", title: "Web Developer", category: "Programming", description: "React" };

  User.find = () => lean([
    { _id: "a", name: "Asha", email: "asha@example.test", jobPreferences: { emailAlerts: true, skills: ["React"], roles: [], locations: [], levels: [] } },
    { _id: "b", name: "Ben", email: "ben@example.test", jobPreferences: { emailAlerts: true, roles: ["Marketing"], skills: [], locations: [], levels: [] } },
    { _id: "c", name: "Chen", email: "chen@example.test", jobPreferences: { emailAlerts: false, skills: ["React"] } },
    { _id: "d", name: "Dev", email: "dev@example.test" }, // no preferences, no activity
    { _id: "e", name: "Ela", email: "ela@example.test", savedJobs: [pastDesignJob._id] }, // activity match
    { _id: "f", name: "Fay", email: "user_f@clerk.user", jobPreferences: { skills: ["React"] } }, // placeholder email
  ]);
  JobApplication.find = () => lean([]);
  Job.find = () => lean([pastDesignJob]);

  const sent = [];
  const summary = await notifyMatchingUsers(reactJob, "Acme", async (mail) => { sent.push(mail); });
  assert.deepEqual(sent.map((m) => m.userEmail).sort(), ["asha@example.test", "ela@example.test"]);
  assert.deepEqual(sent.find((m) => m.userEmail === "asha@example.test").matchReasons, ["React"]);
  assert.equal(summary.matched, 2);
  assert.equal(summary.sent, 2);

  // A failed send is counted, not thrown.
  const failing = await notifyMatchingUsers(reactJob, "Acme", async () => { throw new Error("SMTP down"); });
  assert.equal(failing.failed, 2);
  assert.equal(failing.sent, 0);
});
