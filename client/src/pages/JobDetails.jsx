import React, { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, backendUrl } = useContext(AppContext);

  const job = jobs.find((item) => item._id === id);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [skillsText, setSkillsText] = useState("");
  const [matchData, setMatchData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const relatedJobs = useMemo(() => {
    if (!job) return [];
    return jobs
      .filter(
        (j) =>
          j._id !== job._id &&
          (j.companyId?._id === job.companyId?._id || j.location === job.location)
      )
      .slice(0, 3);
  }, [jobs, job]);

  if (!job) {
    return (
      <div className="min-h-screen flex justify-center items-center text-2xl font-semibold">
        Job Not Found
      </div>
    );
  }

  const initials = job.companyId?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const postedDate = job.date
    ? new Date(job.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 items-start">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium text-sm mb-6 transition-colors"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              Back to jobs
            </button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-5">
                {job.companyId?.image ? (
                  <img
                    src={job.companyId.image}
                    alt={job.companyId?.name}
                    className="w-16 h-16 rounded-xl border border-slate-200 object-contain p-2 bg-white flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {initials || "?"}
                  </div>
                )}

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {job.title}
                  </h1>
                  <p className="text-slate-500 font-medium mt-0.5">
                    {job.companyId?.name}
                  </p>
                  {postedDate && (
                    <p className="text-xs text-slate-400 mt-1">
                      Posted on {postedDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSaved((prev) => !prev)}
                  title={saved ? "Remove from saved" : "Save job"}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                    saved
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {saved ? "★" : "☆"}
                </button>
                <button
                  onClick={handleShare}
                  title="Share this job"
                  className="w-10 h-10 rounded-lg border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center transition-colors relative"
                >
                  ⤴
                  {copied && (
                    <span className="absolute -top-8 right-0 bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md whitespace-nowrap">
                      Link copied
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                📍 {job.location}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                💼 {job.level}
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                ₹ {job.salary}
              </span>
              {job.category && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-md">
                  {job.category}
                </span>
              )}
            </div>

            {/* Quick overview strip */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-medium">Experience</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {job.level || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Job Type</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {job.type || "Full-time"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Openings</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {job.openings || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-600 rounded-full inline-block" />
              Job Description
            </h2>
            <div
              className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          {/* AI Skill Match Analysis Widget */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="inline-block bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full mb-1 border border-indigo-400/30">
                  ✨ Instant Match Check
                </span>
                <h3 className="text-xl font-bold text-white">
                  AI Skill Match Analyzer
                </h3>
              </div>
              <button
                onClick={() => navigate("/ai-match")}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-semibold transition"
              >
                Full Matcher →
              </button>
            </div>

            <p className="text-slate-300 text-sm mb-4">
              Paste your resume or skills below to see your match percentage, matched skills, and missing requirements for this position.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!skillsText.trim()) return;
                try {
                  setAnalyzing(true);
                  const { data } = await axios.post(`${backendUrl}/api/jobs/match`, {
                    jobId: job._id,
                    jobTitle: job.title,
                    jobDescription: job.description,
                    resumeText: skillsText,
                  });
                  if (data.success) {
                    setMatchData(data);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setAnalyzing(false);
                }
              }}
              className="space-y-4"
            >
              <textarea
                rows="3"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Paste your skills or resume text (e.g., React, JavaScript, HTML/CSS, Node.js...)"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
              />

              <button
                type="submit"
                disabled={analyzing}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow"
              >
                {analyzing ? "Analyzing..." : "Calculate Match %"}
              </button>
            </form>

            {matchData && (
              <div className="mt-6 pt-6 border-t border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">
                      Skill Match Score
                    </p>
                    <p className="text-2xl font-extrabold text-white mt-0.5">
                      {matchData.matchLevel} ({matchData.matchPercentage}%)
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-lg ${
                      matchData.matchPercentage >= 75
                        ? "border-emerald-400 text-emerald-400 bg-emerald-950/40"
                        : matchData.matchPercentage >= 50
                        ? "border-amber-400 text-amber-400 bg-amber-950/40"
                        : "border-rose-400 text-rose-400 bg-rose-950/40"
                    }`}
                  >
                    {matchData.matchPercentage}%
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                    <p className="font-bold text-emerald-400 mb-2">
                      ✅ Matched Skills ({matchData.matchedSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.matchedSkills.length > 0 ? (
                        matchData.matchedSkills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800"
                          >
                            ✅ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">None detected</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                    <p className="font-bold text-rose-400 mb-2">
                      ❌ Missing Skills ({matchData.missingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchData.missingSkills.length > 0 ? (
                        matchData.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800"
                          >
                            ❌ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400">All required skills present!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {job.companyId?.about && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-600 rounded-full inline-block" />
                About {job.companyId.name}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {job.companyId.about}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6 sticky top-6">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Ready to apply?
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Takes less than 2 minutes
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/apply-job/${job._id}`)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-base font-semibold transition shadow-sm shadow-indigo-200"
              >
                Apply Now
              </button>

              <button
                onClick={() => navigate(`/job/${job._id}`)}
                className="flex-1 border border-slate-300 py-3 rounded-lg text-base font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition"
              >
                Learn More
              </button>
            </div>
          </div>

          {relatedJobs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Similar Jobs
              </h2>
              <div className="space-y-3">
                {relatedJobs.map((rj) => (
                  <button
                    key={rj._id}
                    onClick={() => navigate(`/job/${rj._id}`)}
                    className="w-full text-left border border-slate-200 rounded-lg p-3.5 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {rj.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rj.companyId?.name}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">
                        {rj.location}
                      </span>
                      <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-medium">
                        ₹{rj.salary}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobDetails;