import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const AIMatcher = () => {
  const { jobs, backendUrl } = useContext(AppContext);
  const location = useLocation();

  const [selectedJobId, setSelectedJobId] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [useCustomJob, setUseCustomJob] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Auto select job from URL query params, location state, or fallback to first job
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const passedJobId = params.get("jobId") || location.state?.jobId;
    const passedResumeName = location.state?.resumeName;

    if (passedJobId) {
      setSelectedJobId(passedJobId);
    } else if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }

    if (passedResumeName && !resumeFileName) {
      setResumeFileName(passedResumeName);
    }
  }, [jobs, location]);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setResumeFileName(file.name);

    // Read file text if plain text / doc or parse name
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result || "";
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!resumeText.trim()) {
      toast.error("Please enter or upload your resume text / skills");
      return;
    }

    try {
      setLoading(true);

      const targetJob = jobs.find((j) => j._id === selectedJobId);

      const payload = useCustomJob
        ? { jobTitle: customJobTitle, jobDescription: customJobDescription, resumeText }
        : {
            jobId: selectedJobId,
            jobTitle: targetJob?.title || "",
            jobDescription: targetJob?.description || "",
            resumeText,
          };

      const { data } = await axios.post(`${backendUrl}/api/jobs/match`, payload);

      if (data.success) {
        setAnalysisResult(data);
        toast.success("AI Match Analysis Complete!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("AI Match Error:", error);
      toast.error(error.response?.data?.message || "Failed to calculate match score");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (pct) => {
    if (pct >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (pct >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getBadgeColor = (pct) => {
    if (pct >= 75) return "bg-emerald-500 text-white";
    if (pct >= 50) return "bg-amber-500 text-white";
    return "bg-rose-500 text-white";
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            ✨ Powered by AI Keyword Matching
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Resume → Job Matcher
          </h1>
          <p className="text-slate-600 mt-2 text-base">
            Upload or paste your resume to instantly compare your skills against job requirements, calculate match percentage, and discover missing skills.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: Inputs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block" />
              1. Target Job
            </h2>

            {/* Job Mode Toggle */}
            <div className="flex gap-3 text-sm font-medium">
              <button
                type="button"
                onClick={() => setUseCustomJob(false)}
                className={`flex-1 py-2.5 rounded-lg border transition ${
                  !useCustomJob
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Select Portal Job
              </button>
              <button
                type="button"
                onClick={() => setUseCustomJob(true)}
                className={`flex-1 py-2.5 rounded-lg border transition ${
                  useCustomJob
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Custom Job Description
              </button>
            </div>

            {!useCustomJob ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Choose Job from Portal
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} — {job.companyId?.name || "Company"} ({job.location})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Job Description / Required Skills
                  </label>
                  <textarea
                    rows="4"
                    value={customJobDescription}
                    onChange={(e) => setCustomJobDescription(e.target.value)}
                    placeholder="Paste job description, required skills, or tech stack..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                  />
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block" />
              2. Candidate Resume / Skills
            </h2>

            {/* Resume File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Upload Resume File (PDF, DOCX, TXT)
              </label>
              <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-5 block text-center hover:border-indigo-400 hover:bg-indigo-50/40 transition">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  hidden
                  onChange={handleFileUpload}
                />
                <p className="text-sm font-medium text-slate-700">
                  {resumeFileName ? `📄 ${resumeFileName}` : "Click to Upload Resume File"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Or paste text below directly
                </p>
              </label>
            </div>

            {/* Resume Text Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Resume Content / Skills Text
              </label>
              <textarea
                rows="6"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text, skills, or experience summary (e.g., Proficient in React, JavaScript, HTML/CSS, Node.js, Express, MongoDB...)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-base transition shadow-md shadow-indigo-200"
            >
              {loading ? "Analyzing Skills..." : "⚡ Calculate AI Match Score"}
            </button>
          </div>

          {/* RIGHT: Analysis Results */}
          <div className="space-y-6">
            {!analysisResult ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">
                  Ready to Calculate Match
                </h3>
                <p className="text-sm text-slate-500">
                  Fill in your resume content and click Calculate to see your skill match score, missing skills, and recommendations.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                {/* Score Header */}
                <div className="flex items-center justify-between border-b pb-6 border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Overall Alignment
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {analysisResult.matchLevel}
                    </h3>
                  </div>

                  <div
                    className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-extrabold ${getScoreColor(
                      analysisResult.matchPercentage
                    )}`}
                  >
                    <span className="text-3xl leading-none">
                      {analysisResult.matchPercentage}%
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                      Match
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>Job Requirement Match</span>
                    <span>{analysisResult.matchPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getBadgeColor(
                        analysisResult.matchPercentage
                      )}`}
                      style={{ width: `${analysisResult.matchPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Skills Breakdown Grid */}
                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  {/* MATCHED SKILLS */}
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Matched Skills ({analysisResult.matchedSkills.length})
                    </h4>

                    {analysisResult.matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.matchedSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1"
                          >
                            ✅ {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No matching skills detected.</p>
                    )}
                  </div>

                  {/* MISSING SKILLS */}
                  <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100 space-y-3">
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Missing Skills ({analysisResult.missingSkills.length})
                    </h4>

                    {analysisResult.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missingSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1"
                          >
                            ❌ {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium">
                        🎉 All required skills present!
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Recommendations */}
                {analysisResult.recommendations?.length > 0 && (
                  <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      💡 AI Recommendations
                    </h4>
                    <ul className="space-y-1.5 text-xs text-indigo-800 leading-relaxed pl-4 list-disc">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMatcher;
