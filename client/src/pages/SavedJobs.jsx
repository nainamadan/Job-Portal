import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const SavedJobs = () => {
  const { jobs: allJobs, backendUrl } = useContext(AppContext);
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [savedJobsList, setSavedJobsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved jobs from localStorage and API
  const loadSavedJobs = async () => {
    try {
      setLoading(true);

      // Get local saved job IDs array
      let localSaved = [];
      try {
        localSaved = JSON.parse(localStorage.getItem("savedJobIds")) || [];
      } catch (err) {
        localSaved = [];
      }

      let backendSavedIds = [];
      let backendJobs = [];

      if (isSignedIn) {
        try {
          const token = await getToken();
          const { data } = await axios.get(`${backendUrl}/api/users/saved-jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (data.success) {
            backendSavedIds = data.savedIds || [];
            backendJobs = data.jobs || [];
          }
        } catch (apiErr) {
          console.warn("Backend saved jobs API error, using local fallback:", apiErr.message);
        }
      }

      // Merge saved IDs
      const combinedSavedIds = Array.from(new Set([...localSaved, ...backendSavedIds]));

      // Filter jobs from global jobs array + backendJobs
      const fullMap = new Map();
      (allJobs || []).forEach((j) => fullMap.set(j._id?.toString(), j));
      backendJobs.forEach((j) => fullMap.set(j._id?.toString(), j));

      const finalSavedList = combinedSavedIds
        .map((id) => fullMap.get(id?.toString()))
        .filter(Boolean);

      setSavedJobsList(finalSavedList);
    } catch (error) {
      console.error("Load Saved Jobs Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, [allJobs, isSignedIn]);

  // Remove job from saved list
  const handleRemoveSaved = async (jobId) => {
    try {
      // Update local storage
      let localSaved = [];
      try {
        localSaved = JSON.parse(localStorage.getItem("savedJobIds")) || [];
      } catch (e) {
        localSaved = [];
      }

      const updatedLocal = localSaved.filter((id) => id?.toString() !== jobId?.toString());
      localStorage.setItem("savedJobIds", JSON.stringify(updatedLocal));

      // Update backend if signed in
      if (isSignedIn) {
        try {
          const token = await getToken();
          await axios.post(
            `${backendUrl}/api/users/toggle-save`,
            { jobId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.warn("Backend toggle save notice:", err.message);
        }
      }

      setSavedJobsList((prev) => prev.filter((j) => j._id?.toString() !== jobId?.toString()));
      toast.info("Job removed from saved list");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200">
          <div>
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
              💾 Bookmarks
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Saved Jobs
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              View and manage all jobs you have bookmarked for quick access and application.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition self-start sm:self-auto"
          >
            ← Explore More Jobs
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            Loading your bookmarked jobs...
          </div>
        ) : savedJobsList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="text-6xl">⭐</div>
            <h3 className="text-xl font-bold text-slate-800">No Saved Jobs Yet</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              You haven't bookmarked any jobs yet. Browse available jobs on the portal and click the star <strong>★ Save</strong> button on job details to save them here!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow"
            >
              Browse Jobs Now
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {savedJobsList.map((job) => {
              const company = job.companyId || {};
              const initials = company.name
                ?.split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "CO";

              return (
                <div
                  key={job._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {company.image ? (
                          <img
                            src={company.image}
                            alt={company.name}
                            className="w-12 h-12 rounded-xl border border-slate-200 object-contain p-1 bg-white flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                            {initials}
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {company.name || "Company"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveSaved(job._id)}
                        title="Remove from saved jobs"
                        className="text-amber-500 hover:text-rose-600 p-1.5 rounded-lg border border-amber-200 hover:border-rose-300 hover:bg-rose-50 transition"
                      >
                        ★
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                        📍 {job.location || "Remote"}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                        💼 {job.level || "Full-time"}
                      </span>
                      <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                        ₹ {job.salary || "Best in Industry"}
                      </span>
                    </div>

                    {job.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {job.description.replace(/<[^>]*>/g, " ")}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/apply-job/${job._id}`)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm"
                    >
                      Apply Now
                    </button>

                    <button
                      onClick={() => navigate(`/job/${job._id}`)}
                      className="flex-1 border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 text-xs font-bold py-2.5 rounded-xl transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedJobs;
