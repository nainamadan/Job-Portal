import { useState } from "react";
import { STAGES, REJECTED, currentStage, stageInfo } from "../utils/hiringStages";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

/** Step-by-step tracker + timeline for one application (job seeker view). */
const ApplicationProgress = ({ application }) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const stage = currentStage(application);
  const rejected = stage === "rejected";

  // For a rejected application, show how far it got before the decision.
  const history = application.stageHistory || [];
  const lastActive = rejected
    ? [...history].reverse().find((h) => h.stage !== "rejected")?.stage || "applied"
    : stage;
  const reachedIndex = STAGES.findIndex((s) => s.key === lastActive);

  const timeline = history.length
    ? [...history].reverse()
    : [{ stage, note: "", at: application.date }]; // older applications without a history yet
  const latest = timeline[0];
  const info = stageInfo(stage);

  return (
    <div className="mt-4">
      {/* Steps */}
      <ol className="flex items-start" aria-label="Application progress">
        {STAGES.map((s, i) => {
          const done = i < reachedIndex || (!rejected && i === reachedIndex);
          const current = !rejected && i === reachedIndex;
          return (
            <li key={s.key} className="flex-1 flex flex-col items-center relative min-w-0">
              {i > 0 && (
                <span
                  className={`absolute top-4 right-1/2 w-full h-1 -z-0 ${i <= reachedIndex ? (rejected ? "bg-slate-300" : "bg-emerald-400") : "bg-slate-200"}`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${
                  current
                    ? "bg-indigo-600 border-indigo-600 ring-4 ring-indigo-100"
                    : done
                    ? "bg-emerald-500 border-emerald-500"
                    : i <= reachedIndex
                    ? "bg-slate-300 border-slate-300"
                    : "bg-white border-slate-200 grayscale opacity-60"
                }`}
                title={s.label}
              >
                {s.emoji}
              </span>
              <span
                className={`mt-1.5 text-[10px] sm:text-xs text-center leading-tight ${
                  current ? "font-bold text-indigo-700" : done ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Current status message */}
      <div
        className={`mt-3 rounded-lg px-3 py-2 text-sm ${
          rejected ? "bg-red-50 text-red-700" : stage === "hired" ? "bg-emerald-50 text-emerald-800" : "bg-indigo-50 text-indigo-800"
        }`}
      >
        <span className="font-semibold">
          {info.emoji} {rejected ? REJECTED.label : info.label}:
        </span>{" "}
        {info.hint}
        {latest?.note && <p className="mt-1 text-slate-700 whitespace-pre-line">💬 “{latest.note}”</p>}
      </div>

      {/* Timeline */}
      <button
        type="button"
        onClick={() => setShowTimeline((v) => !v)}
        className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
        aria-expanded={showTimeline}
      >
        {showTimeline ? "Hide timeline ▲" : `Show timeline (${timeline.length}) ▼`}
      </button>
      {showTimeline && (
        <ul className="mt-2 border-l-2 border-slate-200 ml-2 space-y-3">
          {timeline.map((h, i) => {
            const s = stageInfo(h.stage);
            return (
              <li key={h._id || i} className="pl-4 relative">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-400" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-800">
                  {s.emoji} {s.label}
                </p>
                <p className="text-xs text-slate-400">{formatDate(h.at)}</p>
                {h.note && <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-line">{h.note}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ApplicationProgress;
