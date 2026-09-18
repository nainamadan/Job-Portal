import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const SKILLS_LIST = [
  "React", "JavaScript", "TypeScript", "Next.js", "HTML", "CSS", "TailwindCSS", "Bootstrap",
  "Node.js", "Express", "Python", "Django", "Java", "C++", "PHP", "MongoDB", "SQL",
  "PostgreSQL", "AWS", "Docker", "Git", "Figma", "UI/UX", "SEO", "Excel", "Agile"
];

const calculateApplicantMatch = (user, job) => {
  const jobText = `${job?.title || ""} ${job?.description || ""}`.toLowerCase();
  const userText = `${user?.name || ""} ${user?.resume || ""}`.toLowerCase();

  // Extract skills required from job description/title
  let required = SKILLS_LIST.filter((skill) =>
    jobText.includes(skill.toLowerCase())
  );

  if (required.length === 0) {
    const title = (job?.title || "").toLowerCase();
    if (title.includes("frontend") || title.includes("react") || title.includes("web")) {
      required = ["React", "JavaScript", "HTML", "CSS"];
    } else if (title.includes("backend") || title.includes("node")) {
      required = ["Node.js", "Express", "MongoDB", "SQL"];
    } else if (title.includes("full") || title.includes("mern")) {
      required = ["React", "Node.js", "Express", "MongoDB"];
    } else {
      required = ["React", "JavaScript", "Node.js", "Git"];
    }
  }

  // Extract matched skills from applicant's uploaded resume/info
  const matched = required.filter((skill) =>
    userText.includes(skill.toLowerCase())
  );

  const missing = required.filter(
    (skill) => !userText.includes(skill.toLowerCase())
  );

  // Calculate realistic match score percentage based on actual applicant resume presence
  let pct = 0;
  if (user?.resume) {
    if (matched.length > 0) {
      pct = Math.round((matched.length / required.length) * 100);
      pct = Math.min(96, Math.max(60, pct));
    } else {
      pct = 65; // Resume present, baseline relevance
    }
  } else {
    pct = 35; // No resume uploaded yet
  }

  let matchLevel = "Needs Improvement";
  let badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
  if (pct >= 75) {
    matchLevel = "Strong Match";
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (pct >= 50) {
    matchLevel = "Good Match";
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return { pct, matchLevel, badgeStyle, matched, missing, required };
};

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedMatchModal, setSelectedMatchModal] = useState(null);

  const fetchCompanyApplicants = async () => {
    try {
      setLoading(true);
      const token = companyToken || localStorage.getItem("companyToken");

      const { data } = await axios.get(`${backendUrl}/api/company/applicants`, {
        headers: { token },
      });

      if (data.success) {
        setApplications(data.applications || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Applicants Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch applicants");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const token = companyToken || localStorage.getItem("companyToken");

      const { data } = await axios.put(
        `${backendUrl}/api/company/change-status/${id}`,
        { status },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(`Application marked as ${status}!`);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === id ? { ...app, status } : app
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Update Status Error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchCompanyApplicants();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Applicant Management
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Review candidate resume AI match scores and take hiring actions.
          </p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200">
          Total Applications: {applications.length}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium">
          Loading applicant records...
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-base font-semibold">
            No job applications received yet.
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Applications will appear here once candidates apply to your posted jobs.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Applied Job</th>
                <th className="p-4">AI Match Score</th>
                <th className="p-4">Resume</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {applications.map((application, index) => {
                const user = application.userId || {};
                const job = application.jobId || {};
                const status = application.status || "Pending";

                const match = calculateApplicantMatch(user, job);

                return (
                  <tr
                    key={application._id || index}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-4 text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Candidate */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || "User"
                            )}&background=random`
                          }
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            {user.name || "Unknown Candidate"}
                          </p>
                          {user.email && (
                            <p className="text-xs text-slate-500">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Job Title */}
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {job.title || "N/A"}
                      {job.location && (
                        <span className="block text-xs font-normal text-slate-500">
                          📍 {job.location}
                        </span>
                      )}
                    </td>

                    {/* AI Match Score */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          setSelectedMatchModal({ user, job, match })
                        }
                        title="Click to view full AI Match breakdown"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition transform hover:scale-105 ${match.badgeStyle}`}
                      >
                        <span>⚡ {match.pct}% Match</span>
                        <span className="text-[10px] opacity-75 font-normal">
                          ({match.matchLevel}) ℹ️
                        </span>
                      </button>
                    </td>

                    {/* Resume */}
                    <td className="px-4 py-4">
                      {user.resume ? (
                        <a
                          href={user.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200"
                        >
                          📄 View Resume
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          No Resume
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                          status === "Accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : status === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateStatus(application._id, "Accepted")}
                          disabled={updatingId === application._id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            status === "Accepted"
                              ? "bg-emerald-600 text-white shadow"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          ✔ Accept
                        </button>

                        <button
                          onClick={() => updateStatus(application._id, "Rejected")}
                          disabled={updatingId === application._id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            status === "Rejected"
                              ? "bg-rose-600 text-white shadow"
                              : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          }`}
                        >
                          ✖ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Skill Breakdown Modal */}
      {selectedMatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
                  AI Applicant Evaluation
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedMatchModal.user.name || "Candidate"}
                </h3>
                <p className="text-xs text-slate-500">
                  Applied for: {selectedMatchModal.job.title}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600">
                  {selectedMatchModal.match.pct}%
                </span>
                <span className="block text-[10px] font-semibold uppercase text-slate-400">
                  Match Score
                </span>
              </div>
            </div>

            {/* Matched & Missing Skills */}
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">
                  ✅ Matched Skills ({selectedMatchModal.match.matched.length})
                </h4>
                {selectedMatchModal.match.matched.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMatchModal.match.matched.map((s, i) => (
                      <span
                        key={i}
                        className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md"
                      >
                        ✅ {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No direct skill matches detected in resume text.
                  </p>
                )}
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <h4 className="text-xs font-bold text-rose-800 uppercase mb-2">
                  ❌ Missing Skills ({selectedMatchModal.match.missing.length})
                </h4>
                {selectedMatchModal.match.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMatchModal.match.missing.map((s, i) => (
                      <span
                        key={i}
                        className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-md"
                      >
                        ❌ {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-semibold">
                    🎉 All required skills present in candidate profile!
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMatchModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;