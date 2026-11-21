import { useState } from "react";
import { stageInfo } from "../utils/hiringStages";

const NOTE_IDEAS = {
  applied: "We've moved your application back to the start for another look.",
  under_review: "Thanks for applying! Our team is reviewing your profile.",
  shortlisted: "Great news, you've been shortlisted. We'll share next steps soon.",
  offered: "We're happy to offer you the role! Details will follow by email.",
  hired: "Welcome aboard! 🎉 Our HR team will contact you about onboarding.",
};

/** Recruiter pop-up: confirm moving an application to `stage`, with an optional note. */
const StageUpdateModal = ({ application, stage, saving, onCancel, onConfirm }) => {
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const info = stageInfo(stage);
  const name = application.userId?.name || "the candidate";

  return (
    <div className="modal-backdrop fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-label={`Move to ${info.label}`}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel w-full max-w-md bg-white rounded-2xl shadow-2xl"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-4">
          <p className="text-xs text-indigo-100">Update hiring progress</p>
          <h3 className="text-lg font-bold">
            {info.emoji} Move {name} to “{info.label}”
          </h3>
          <p className="text-xs text-indigo-100 mt-0.5">{application.jobId?.title}</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="stage-note">
              Note for the candidate <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="stage-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={NOTE_IDEAS[stage] || "Add a short message…"}
              className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {NOTE_IDEAS[stage] && !note && (
              <button type="button" onClick={() => setNote(NOTE_IDEAS[stage])} className="text-xs text-indigo-600 hover:underline">
                Use suggested note
              </button>
            )}
            <p className="text-xs text-slate-400 mt-1">The candidate sees this in their progress timeline.</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            ✉️ Email the candidate about this update
          </label>
        </div>

        <div className="px-5 py-4 bg-slate-50 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onConfirm({ note, notifyCandidate: notify })}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-60"
          >
            {saving ? "Updating…" : "Update progress"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageUpdateModal;
