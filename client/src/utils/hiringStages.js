// Same stages as server/utils/hiringStages.js, plus emoji and colours for the website.
export const STAGES = [
  { key: "applied", label: "Applied", emoji: "📝", hint: "Your application was received." },
  { key: "under_review", label: "Under Review", emoji: "👀", hint: "The recruiter is reviewing your profile." },
  { key: "shortlisted", label: "Shortlisted", emoji: "⭐", hint: "You made the shortlist!" },
  { key: "interview", label: "Interview", emoji: "🗓️", hint: "You're invited to interview." },
  { key: "offered", label: "Offer Made", emoji: "🎁", hint: "You've received an offer." },
  { key: "hired", label: "Hired", emoji: "🎉", hint: "Congratulations, you're hired!" },
];
export const REJECTED = { key: "rejected", label: "Not Selected", emoji: "❌", hint: "The company chose not to move forward." };

export const ALL_STAGES = [...STAGES, REJECTED];
export const stageInfo = (key) => ALL_STAGES.find((s) => s.key === key) || STAGES[0];

// Stages a recruiter can set directly; Interview and Not Selected use Accept / Reject.
export const MANUAL_STAGES = ["applied", "under_review", "shortlisted", "offered", "hired"];

const statusToStage = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "accepted") return "interview";
  if (s === "rejected") return "rejected";
  return "applied";
};

// Older applications have no stage yet; work it out from the old status.
export const currentStage = (app) =>
  ALL_STAGES.some((s) => s.key === app?.stage) ? app.stage : statusToStage(app?.status);

export const stageBadgeClass = (key) =>
  ({
    applied: "bg-slate-100 text-slate-700",
    under_review: "bg-amber-100 text-amber-800",
    shortlisted: "bg-sky-100 text-sky-800",
    interview: "bg-indigo-100 text-indigo-800",
    offered: "bg-purple-100 text-purple-800",
    hired: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-700",
  })[key] || "bg-slate-100 text-slate-700";
