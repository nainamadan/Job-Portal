// The hiring process every application moves through.
// The older `status` field (Pending / Accepted / Rejected) is kept in sync for existing screens and emails.
export const STAGES = [
  { key: "applied", label: "Applied", status: "Pending" },
  { key: "under_review", label: "Under Review", status: "Pending" },
  { key: "shortlisted", label: "Shortlisted", status: "Pending" },
  { key: "interview", label: "Interview", status: "Accepted" },
  { key: "offered", label: "Offer Made", status: "Accepted" },
  { key: "hired", label: "Hired", status: "Accepted" },
  { key: "rejected", label: "Not Selected", status: "Rejected" },
];

export const STAGE_KEYS = STAGES.map((s) => s.key);
// "interview" and "rejected" go through the existing Accept / Reject flow,
// which collects interview details or feedback and sends those emails.
export const MANUAL_STAGE_KEYS = ["applied", "under_review", "shortlisted", "offered", "hired"];
export const MAX_STAGE_NOTE = 1000;

export const stageLabel = (key) => STAGES.find((s) => s.key === key)?.label || key;
export const stageToStatus = (key) => STAGES.find((s) => s.key === key)?.status || "Pending";

export const statusToStage = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "accepted") return "interview";
  if (s === "rejected") return "rejected";
  return "applied";
};

// Older applications have no `stage` yet; work it out from `status`.
export const currentStage = (application) =>
  STAGE_KEYS.includes(application?.stage) ? application.stage : statusToStage(application?.status);
