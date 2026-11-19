import { useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { JobCategories, JobLocations } from "../assets/assets";

// Lets a job seeker choose which "new job posted" emails they get.
// Only jobs that fit these choices are emailed (server/utils/jobAlertMatcher.js).
const GROUPS = [
  {
    key: "roles",
    label: "🧭 Roles / categories",
    placeholder: "e.g. Frontend Developer",
    suggestions: JobCategories,
  },
  {
    key: "skills",
    label: "🛠️ Skills",
    placeholder: "e.g. React",
    suggestions: ["React", "JavaScript", "Node.js", "Python", "Java", "SQL", "Figma", "AWS", "Excel", "SEO"],
  },
  {
    key: "locations",
    label: "📍 Locations",
    placeholder: "e.g. Pune",
    suggestions: [...new Set(["Remote", "Bangalore", "Delhi", "Hyderabad", "Pune", ...JobLocations])],
  },
  {
    key: "levels",
    label: "📈 Experience",
    placeholder: "e.g. 1-3 Years",
    suggestions: ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"],
  },
];

const EMPTY = { emailAlerts: true, roles: [], skills: [], locations: [], levels: [] };

const TagGroup = ({ group, values, onChange }) => {
  const [draft, setDraft] = useState("");
  const has = (v) => values.some((x) => x.toLowerCase() === v.toLowerCase());
  const add = (v) => {
    const clean = v.trim();
    if (clean && !has(clean) && clean.length <= 60 && values.length < 20) onChange([...values, clean]);
    setDraft("");
  };
  const remove = (v) => onChange(values.filter((x) => x !== v));
  const unused = group.suggestions.filter((s) => !has(s));

  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-2">{group.label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white rounded-full pl-2.5 pr-1 py-1">
            {v}
            <button type="button" onClick={() => remove(v)} aria-label={`Remove ${v}`} className="w-4 h-4 rounded-full hover:bg-white/25 leading-none">
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={group.placeholder}
          maxLength={60}
          aria-label={group.label}
          className="flex-1 min-w-[110px] text-xs px-2.5 py-1 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {unused.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const JobAlertPreferences = () => {
  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();
  const [prefs, setPrefs] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/users/job-preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setPrefs({ ...EMPTY, ...data.preferences });
    } catch (error) {
      console.warn("Job alert preferences:", error.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, getToken]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    return () => clearTimeout(first);
  }, [load]);

  const update = (key, value) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const { data } = await axios.put(`${backendUrl}/api/users/job-preferences`, prefs, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!data.success) throw new Error(data.message);
      setPrefs({ ...EMPTY, ...data.preferences });
      setDirty(false);
      toast.success("Job alerts saved 🔔");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not save job alerts.");
    } finally {
      setSaving(false);
    }
  };

  const nothingChosen = GROUPS.every((g) => !prefs[g.key]?.length);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">🔔 Job Alerts</h2>
          <p className="text-xs text-slate-500 mt-1">
            We only email you new jobs that match your choices.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={prefs.emailAlerts}
            onChange={(e) => update("emailAlerts", e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          Email me
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 mt-4">Loading…</p>
      ) : (
        <>
          <div className={`space-y-5 mt-5 ${prefs.emailAlerts ? "" : "opacity-50 pointer-events-none"}`}>
            {GROUPS.map((g) => (
              <TagGroup key={g.key} group={g} values={prefs[g.key] || []} onChange={(v) => update(g.key, v)} />
            ))}
          </div>

          {prefs.emailAlerts && nothingChosen && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-4">
              💡 Nothing chosen yet. Until you pick something, we only email jobs similar to ones you've applied to or saved.
            </p>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {saving ? "Saving…" : dirty ? "Save job alerts" : "Saved ✓"}
          </button>
        </>
      )}
    </div>
  );
};

export default JobAlertPreferences;
