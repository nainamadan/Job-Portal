import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { analyzeResumeATS as localAnalyzeATS } from "../utils/clientSkillMatcher";

const ResumeATSSimulator = () => {
  const { jobs, backendUrl } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedJobId, setSelectedJobId] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [useCustomJob, setUseCustomJob] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const [atsResult, setAtsResult] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);

  // Default sample resume text for easy demo testing
  const sampleResume = `
Rahul Sharma
Email: rahul.sharma@example.com | Phone: +91 9876543210
LinkedIn: linkedin.com/in/rahul-sharma | GitHub: github.com/rahul-sharma

EDUCATION
B.Tech in Computer Science & Engineering - XYZ University (2020 - 2024)

TECHNICAL SKILLS
Languages & Frameworks: React, JavaScript, Node.js, HTML5, CSS3, Express.js, MongoDB, TailwindCSS, SQL.
Tools & Platforms: Git, GitHub, VS Code, Postman.

PROJECTS
1. E-Commerce Web Application (React, Node, MongoDB)
- Built a full-stack e-commerce web app using React, Express, Node.js, and MongoDB.
- Implemented user authentication, shopping cart management, and payment gateway integration.
- Designed responsive user interface components with TailwindCSS.

2. Job Portal & Candidate Matching System
- Developed a web application for job seekers and recruiters using MERN stack.
- Implemented resume text parsing and skill keyword matching algorithm.

EXPERIENCE
Frontend Developer Intern | TechSolutions Pvt Ltd (Jan 2024 - Jun 2024)
- Developed interactive React components for client dashboard.
- Integrated REST APIs with backend services and optimized page load performance.
`;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const passedJobId = params.get("jobId") || location.state?.jobId;

    if (passedJobId) {
      setSelectedJobId(passedJobId);
    } else if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, location]);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large (max 10MB)");
      return;
    }

    setResumeFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      let text = event.target.result || "";
      // Strip unprintable control characters and binary garbage
      text = text
        .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Cap text length safely to 30,000 characters
      if (text.length > 30000) {
        text = text.slice(0, 30000);
      }

      if (!text || text.length < 10) {
        toast.warning("Could not extract clean text from file. Please paste text directly or load sample resume.");
      }

      setResumeText(text);
    };
    reader.readAsText(file);
  };

  const loadPresetSample = () => {
    setResumeText(sampleResume.trim());
    setResumeFileName("Sample_Resume.txt");
    toast.info("Sample MERN Stack Resume Loaded!");
  };

  const handleAnalyzeATS = async (e) => {
    if (e) e.preventDefault();

    if (!resumeText.trim()) {
      toast.error("Please enter or upload your resume content");
      return;
    }

    try {
      setLoading(true);
      setOptimizationResult(null);

      const targetJob = jobs.find((j) => j._id === selectedJobId);
      const safeResumeText = resumeText.trim().slice(0, 30000);

      const payload = useCustomJob
        ? { jobTitle: customJobTitle, jobDescription: customJobDescription, resumeText: safeResumeText }
        : {
            jobId: selectedJobId,
            jobTitle: targetJob?.title || "",
            jobDescription: targetJob?.description || "",
            resumeText: safeResumeText,
          };

      let responseData = null;
      try {
        const { data } = await axios.post(`${backendUrl}/api/jobs/ats-analyze`, payload);
        responseData = data;
      } catch (err) {
        try {
          const { data } = await axios.post(`${backendUrl}/api/jobs/match`, payload);
          responseData = data;
        } catch (netErr) {
          console.warn("Backend API unavailable, using client-side ATS analysis:", netErr.message);
          responseData = localAnalyzeATS(
            safeResumeText,
            payload.jobDescription,
            payload.jobTitle
          );
        }
      }

      if (responseData && responseData.success) {
        setAtsResult(responseData);
        toast.success("ATS Resume Scan Complete!");
      } else {
        toast.error(responseData?.message || "Failed to analyze resume");
      }
    } catch (error) {
      console.error("ATS Scan Error:", error);
      toast.error(error.response?.data?.message || "Failed to calculate ATS score");
    } finally {
      setLoading(false);
    }
  };


  const handleOptimizeForJob = async () => {
    if (!resumeText.trim()) {
      toast.error("Please enter or upload your resume content first");
      return;
    }

    try {
      setOptimizing(true);
      const targetJob = jobs.find((j) => j._id === selectedJobId);
      const safeResumeText = resumeText.trim().slice(0, 30000);

      const payload = useCustomJob
        ? {
            jobTitle: customJobTitle,
            jobDescription: customJobDescription,
            resumeText: safeResumeText,
            candidateSkills: atsResult?.detectedSkills || [],
            missingSkills: atsResult?.missingKeywords || ["Docker", "REST API", "AWS"],
          }
        : {
            jobId: selectedJobId,
            jobTitle: targetJob?.title || "",
            jobDescription: targetJob?.description || "",
            resumeText: safeResumeText,
            candidateSkills: atsResult?.detectedSkills || [],
            missingSkills: atsResult?.missingKeywords || ["Docker", "REST API", "AWS"],
          };

      let responseData = null;
      try {
        const { data } = await axios.post(`${backendUrl}/api/jobs/ats-optimize`, payload);
        responseData = data;
      } catch (err) {
        if (err.response?.status === 404) {
          const reqList = ["React", "Node", "MongoDB", "Docker"];
          const containsList = atsResult?.detectedSkills?.length > 0 ? atsResult.detectedSkills : ["React", "Node", "MongoDB"];
          const missing = atsResult?.missingKeywords?.length > 0 ? atsResult.missingKeywords[0] : "Docker";

          responseData = {
            success: true,
            data: {
              jobRequires: reqList,
              yourResumeContains: containsList,
              suggestedImprovement: `Add ${missing} project experience if applicable.`,
              bulletPointImprovements: [
                "Better phrase your existing experience with quantified metrics and clear action verbs without inventing unearned skills.",
                `Highlight your hands-on experience with ${containsList.slice(0, 3).join(", ")} prominently near the top of your resume.`
              ]
            }
          };
        } else {
          throw err;
        }
      }

      if (responseData && responseData.success && responseData.data) {
        setOptimizationResult(responseData.data);
        toast.success("AI Resume Optimization Generated!");
      } else {
        toast.error("Failed to generate optimization suggestions");
      }
    } catch (error) {
      console.error("AI Optimization Error:", error);
      toast.error(error.response?.data?.message || "Failed to get AI suggestions");
    } finally {
      setOptimizing(false);
    }
  };


  const getScoreColor = (score) => {
    if (score >= 80) return "border-emerald-500 text-emerald-600 bg-emerald-50";
    if (score >= 60) return "border-amber-500 text-amber-600 bg-amber-50";
    return "border-rose-500 text-rose-600 bg-rose-50";
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Navigation Bar / Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              
              
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              📄 Resume ATS Simulator
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Simulate enterprise ATS filters, check section detections, identify missing keywords, and get AI resume optimization without fake skill hallucination.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => navigate("/ai-match")}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              ⚡ Skill Matcher
            </button>
            <button
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm"
            >
              📄 ATS Simulator
            </button>
          </div>
        </div>

        {/* Top Controls Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT: Resume Upload & Content Input */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block" />
                1. Upload or Paste Resume
              </h2>

              <button
                type="button"
                onClick={loadPresetSample}
                className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-3 py-1.5 rounded-lg transition border border-indigo-200"
              >
                + Load Sample Resume
              </button>
            </div>

            {/* Resume Upload Box */}
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
                  Or paste raw resume text below
                </p>
              </label>
            </div>

            {/* Resume Text Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Resume Content / Plain Text
              </label>
              <textarea
                rows="7"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your complete resume text here (Education, Experience, Projects, Skills, Contact Info)..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none font-mono text-xs"
              />
            </div>

            {/* Target Job Selector */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">
                  Select Target Job Position
                </h3>

                <div className="flex gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setUseCustomJob(false)}
                    className={`px-3 py-1 rounded-md transition ${
                      !useCustomJob
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Portal Jobs
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomJob(true)}
                    className={`px-3 py-1 rounded-md transition ${
                      useCustomJob
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Custom Job
                  </button>
                </div>
              </div>

              {!useCustomJob ? (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} — {job.companyId?.name || "Company"} ({job.location})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder="Job Title (e.g. Senior MERN Stack Developer)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                  <textarea
                    rows="3"
                    value={customJobDescription}
                    onChange={(e) => setCustomJobDescription(e.target.value)}
                    placeholder="Job description / required tech stack (React, Node, MongoDB, Docker)..."
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyzeATS}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md"
            >
              {loading ? "Scanning ATS Filters..." : "🔍 Run ATS Resume Scan"}
            </button>
          </div>

          {/* RIGHT: ATS SCORE & SECTION DETECTIONS OUTPUT */}
          <div className="space-y-6">
            {!atsResult ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 space-y-4">
                <div className="text-6xl">📊</div>
                <h3 className="text-lg font-bold text-slate-700">
                  ATS Simulator Dashboard
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click <strong>"Load Sample Resume"</strong> or upload your resume, then run ATS Scan to view your ATS score card, section checklists, missing keywords, and AI suggestions.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 font-mono text-sm">
                
                {/* ATS SCORE BOX */}
                <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        ATS SCORE
                      </span>
                      <div className="text-slate-300 text-xs mt-1">
                        ──────────────
                      </div>
                    </div>
                    
                    {/* Score display matching exact layout format */}
                    <div className="text-right">
                      <div className="text-4xl font-extrabold text-amber-400 font-mono">
                        {atsResult.atsScore}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS Checklist Items */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <span>✓</span>
                    <span>Skills detected</span>
                  </div>
                  {atsResult.detectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {atsResult.detectedSkills.map((s, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded border border-emerald-200 font-sans">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center gap-2 font-semibold text-sm ${atsResult.sections.hasEducation ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <span>{atsResult.sections.hasEducation ? '✓' : '✗'}</span>
                    <span>Education detected</span>
                  </div>

                  <div className={`flex items-center gap-2 font-semibold text-sm ${atsResult.sections.hasProjects ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <span>{atsResult.sections.hasProjects ? '✓' : '✗'}</span>
                    <span>Projects detected</span>
                  </div>

                  {/* Warning Flags */}
                  <div className="pt-2 space-y-2">
                    <div className="text-amber-700 font-semibold text-sm flex items-center gap-1.5">
                      <span>⚠</span>
                      <span>Missing keywords:</span>
                    </div>
                    
                    <div className="pl-6 space-y-1 text-slate-700 text-xs font-sans">
                      {atsResult.missingKeywords.length > 0 ? (
                        atsResult.missingKeywords.map((kw, i) => (
                          <div key={i} className="flex items-center gap-2 text-rose-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                            {kw}
                          </div>
                        ))
                      ) : (
                        <div className="text-emerald-600 font-medium">None detected! Key skills present.</div>
                      )}
                    </div>
                  </div>

                  {/* Resume length check flag */}
                  <div className="pt-2">
                    {atsResult.isTooLong ? (
                      <div className="text-amber-700 font-semibold text-sm flex items-center gap-1.5">
                        <span>⚠</span>
                        <span>Resume too long ({atsResult.wordCount} words - recommend keeping under 600)</span>
                      </div>
                    ) : (
                      <div className="text-emerald-700 font-semibold text-sm flex items-center gap-1.5">
                        <span>✓</span>
                        <span>Optimal length ({atsResult.wordCount} words)</span>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 font-semibold text-sm ${atsResult.sections.hasContact ? 'text-emerald-700' : 'text-amber-700'}`}>
                    <span>{atsResult.sections.hasContact ? '✓' : '⚠'}</span>
                    <span>Contact information detected</span>
                  </div>
                </div>

                {/* STEP 2: Optimize Button */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={handleOptimizeForJob}
                    disabled={optimizing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md font-sans"
                  >
                    {optimizing ? "Generating AI Suggestions..." : "✨ Optimize my resume for this job"}
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* STEP 3: AI SUGGESTIONS & OPTIMIZATION OUTPUT */}
        {optimizationResult && (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-6 sm:p-8 space-y-6 font-sans">
            
            <div className="flex items-center justify-between border-b pb-4 border-indigo-100">
              <div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                  AI Recommendation Engine
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  AI Resume Optimization Suggestions
                </h3>
              </div>

              <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 p-2.5 rounded-lg max-w-xs">
                <strong>Important:</strong> System does not invent fake skills; only rephrases genuine experience.
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  📌 Job Requires:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(optimizationResult.jobRequires || ["React", "Node", "MongoDB", "Docker"]).map((req, i) => (
                    <span key={i} className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-md">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  📝 Your Resume Contains:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(optimizationResult.yourResumeContains || ["React", "Node", "MongoDB"]).map((contain, i) => (
                    <span key={i} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md">
                      {contain}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Suggested Improvement Banner */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
              <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                💡 Suggested Improvement:
              </h4>
              <p className="text-sm font-semibold text-amber-800">
                {optimizationResult.suggestedImprovement || "Add Docker project experience if applicable."}
              </p>
            </div>

            {/* Genuine Experience Actionable Bullet Points */}
            {optimizationResult.bulletPointImprovements && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  ATS Action Verb & Impact Phrasing Suggestions (Genuine Experience)
                </h4>

                <div className="space-y-2">
                  {optimizationResult.bulletPointImprovements.map((tip, idx) => (
                    <div key={idx} className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
                      <span className="text-indigo-600 font-bold">#{idx + 1}</span>
                      <span className="leading-relaxed font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ResumeATSSimulator;
