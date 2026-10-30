// // // // // import React, { useState, useContext, useEffect } from "react";
// // // // // import { useLocation, useNavigate } from "react-router-dom";
// // // // // import axios from "axios";
// // // // // import { toast } from "react-toastify";
// // // // // import { AppContext } from "../context/AppContext";
// // // // // import { analyzeResumeATS as localAnalyzeATS } from "../utils/clientSkillMatcher";

// // // // // const ResumeATSSimulator = () => {
// // // // //   const { jobs, backendUrl } = useContext(AppContext);
// // // // //   const location = useLocation();
// // // // //   const navigate = useNavigate();

// // // // //   const [selectedJobId, setSelectedJobId] = useState("");
// // // // //   const [customJobTitle, setCustomJobTitle] = useState("");
// // // // //   const [customJobDescription, setCustomJobDescription] = useState("");
// // // // //   const [useCustomJob, setUseCustomJob] = useState(false);

// // // // //   const [resumeText, setResumeText] = useState("");
// // // // //   const [resumeFileName, setResumeFileName] = useState("");
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [optimizing, setOptimizing] = useState(false);

// // // // //   const [atsResult, setAtsResult] = useState(null);
// // // // //   const [optimizationResult, setOptimizationResult] = useState(null);

// // // // //   // Default sample resume text for easy demo testing
// // // // //   const sampleResume = `
// // // // // Rahul Sharma
// // // // // Email: rahul.sharma@example.com | Phone: +91 9876543210
// // // // // LinkedIn: linkedin.com/in/rahul-sharma | GitHub: github.com/rahul-sharma

// // // // // EDUCATION
// // // // // B.Tech in Computer Science & Engineering - XYZ University (2020 - 2024)

// // // // // TECHNICAL SKILLS
// // // // // Languages & Frameworks: React, JavaScript, Node.js, HTML5, CSS3, Express.js, MongoDB, TailwindCSS, SQL.
// // // // // Tools & Platforms: Git, GitHub, VS Code, Postman.

// // // // // PROJECTS
// // // // // 1. E-Commerce Web Application (React, Node, MongoDB)
// // // // // - Built a full-stack e-commerce web app using React, Express, Node.js, and MongoDB.
// // // // // - Implemented user authentication, shopping cart management, and payment gateway integration.
// // // // // - Designed responsive user interface components with TailwindCSS.

// // // // // 2. Job Portal & Candidate Matching System
// // // // // - Developed a web application for job seekers and recruiters using MERN stack.
// // // // // - Implemented resume text parsing and skill keyword matching algorithm.

// // // // // EXPERIENCE
// // // // // Frontend Developer Intern | TechSolutions Pvt Ltd (Jan 2024 - Jun 2024)
// // // // // - Developed interactive React components for client dashboard.
// // // // // - Integrated REST APIs with backend services and optimized page load performance.
// // // // // `;

// // // // //   useEffect(() => {
// // // // //     const params = new URLSearchParams(location.search);
// // // // //     const passedJobId = params.get("jobId") || location.state?.jobId;

// // // // //     if (passedJobId) {
// // // // //       setSelectedJobId(passedJobId);
// // // // //     } else if (jobs && jobs.length > 0 && !selectedJobId) {
// // // // //       setSelectedJobId(jobs[0]._id);
// // // // //     }
// // // // //   }, [jobs, location]);

// // // // //   const handleFileUpload = (e) => {
// // // // //     const file = e.target.files && e.target.files[0];
// // // // //     if (!file) return;

// // // // //     if (file.size > 10 * 1024 * 1024) {
// // // // //       toast.error("File size is too large (max 10MB)");
// // // // //       return;
// // // // //     }

// // // // //     setResumeFileName(file.name);

// // // // //     const reader = new FileReader();
// // // // //     reader.onload = (event) => {
// // // // //       let text = event.target.result || "";
// // // // //       // Strip unprintable control characters and binary garbage
// // // // //       text = text
// // // // //         .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, " ")
// // // // //         .replace(/\s+/g, " ")
// // // // //         .trim();

// // // // //       // Cap text length safely to 30,000 characters
// // // // //       if (text.length > 30000) {
// // // // //         text = text.slice(0, 30000);
// // // // //       }

// // // // //       if (!text || text.length < 10) {
// // // // //         toast.warning("Could not extract clean text from file. Please paste text directly or load sample resume.");
// // // // //       }

// // // // //       setResumeText(text);
// // // // //     };
// // // // //     reader.readAsText(file);
// // // // //   };

// // // // //   const loadPresetSample = () => {
// // // // //     setResumeText(sampleResume.trim());
// // // // //     setResumeFileName("Sample_Resume.txt");
// // // // //     toast.info("Sample MERN Stack Resume Loaded!");
// // // // //   };

// // // // //   const handleAnalyzeATS = async (e) => {
// // // // //     if (e) e.preventDefault();

// // // // //     if (!resumeText.trim()) {
// // // // //       toast.error("Please enter or upload your resume content");
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setLoading(true);
// // // // //       setOptimizationResult(null);

// // // // //       const targetJob = jobs.find((j) => j._id === selectedJobId);
// // // // //       const safeResumeText = resumeText.trim().slice(0, 30000);

// // // // //       const payload = useCustomJob
// // // // //         ? { jobTitle: customJobTitle, jobDescription: customJobDescription, resumeText: safeResumeText }
// // // // //         : {
// // // // //             jobId: selectedJobId,
// // // // //             jobTitle: targetJob?.title || "",
// // // // //             jobDescription: targetJob?.description || "",
// // // // //             resumeText: safeResumeText,
// // // // //           };

// // // // //       let responseData = null;
// // // // //       try {
// // // // //         const { data } = await axios.post(`${backendUrl}/api/jobs/ats-analyze`, payload);
// // // // //         responseData = data;
// // // // //       } catch (err) {
// // // // //         try {
// // // // //           const { data } = await axios.post(`${backendUrl}/api/jobs/match`, payload);
// // // // //           responseData = data;
// // // // //         } catch (netErr) {
// // // // //           console.warn("Backend API unavailable, using client-side ATS analysis:", netErr.message);
// // // // //           responseData = localAnalyzeATS(
// // // // //             safeResumeText,
// // // // //             payload.jobDescription,
// // // // //             payload.jobTitle
// // // // //           );
// // // // //         }
// // // // //       }

// // // // //       if (responseData && responseData.success) {
// // // // //         setAtsResult(responseData);
// // // // //         toast.success("ATS Resume Scan Complete!");
// // // // //       } else {
// // // // //         toast.error(responseData?.message || "Failed to analyze resume");
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.error("ATS Scan Error:", error);
// // // // //       toast.error(error.response?.data?.message || "Failed to calculate ATS score");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };


// // // // //   const handleOptimizeForJob = async () => {
// // // // //     if (!resumeText.trim()) {
// // // // //       toast.error("Please enter or upload your resume content first");
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setOptimizing(true);
// // // // //       const targetJob = jobs.find((j) => j._id === selectedJobId);
// // // // //       const safeResumeText = resumeText.trim().slice(0, 30000);

// // // // //       const payload = useCustomJob
// // // // //         ? {
// // // // //             jobTitle: customJobTitle,
// // // // //             jobDescription: customJobDescription,
// // // // //             resumeText: safeResumeText,
// // // // //             candidateSkills: atsResult?.detectedSkills || [],
// // // // //             missingSkills: atsResult?.missingKeywords || ["Docker", "REST API", "AWS"],
// // // // //           }
// // // // //         : {
// // // // //             jobId: selectedJobId,
// // // // //             jobTitle: targetJob?.title || "",
// // // // //             jobDescription: targetJob?.description || "",
// // // // //             resumeText: safeResumeText,
// // // // //             candidateSkills: atsResult?.detectedSkills || [],
// // // // //             missingSkills: atsResult?.missingKeywords || ["Docker", "REST API", "AWS"],
// // // // //           };

// // // // //       let responseData = null;
// // // // //       try {
// // // // //         const { data } = await axios.post(`${backendUrl}/api/jobs/ats-optimize`, payload);
// // // // //         responseData = data;
// // // // //       } catch (err) {
// // // // //         if (err.response?.status === 404) {
// // // // //           const reqList = ["React", "Node", "MongoDB", "Docker"];
// // // // //           const containsList = atsResult?.detectedSkills?.length > 0 ? atsResult.detectedSkills : ["React", "Node", "MongoDB"];
// // // // //           const missing = atsResult?.missingKeywords?.length > 0 ? atsResult.missingKeywords[0] : "Docker";

// // // // //           responseData = {
// // // // //             success: true,
// // // // //             data: {
// // // // //               jobRequires: reqList,
// // // // //               yourResumeContains: containsList,
// // // // //               suggestedImprovement: `Add ${missing} project experience if applicable.`,
// // // // //               bulletPointImprovements: [
// // // // //                 "Better phrase your existing experience with quantified metrics and clear action verbs without inventing unearned skills.",
// // // // //                 `Highlight your hands-on experience with ${containsList.slice(0, 3).join(", ")} prominently near the top of your resume.`
// // // // //               ]
// // // // //             }
// // // // //           };
// // // // //         } else {
// // // // //           throw err;
// // // // //         }
// // // // //       }

// // // // //       if (responseData && responseData.success && responseData.data) {
// // // // //         setOptimizationResult(responseData.data);
// // // // //         toast.success("AI Resume Optimization Generated!");
// // // // //       } else {
// // // // //         toast.error("Failed to generate optimization suggestions");
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.error("AI Optimization Error:", error);
// // // // //       toast.error(error.response?.data?.message || "Failed to get AI suggestions");
// // // // //     } finally {
// // // // //       setOptimizing(false);
// // // // //     }
// // // // //   };


// // // // //   const getScoreColor = (score) => {
// // // // //     if (score >= 80) return "border-emerald-500 text-emerald-600 bg-emerald-50";
// // // // //     if (score >= 60) return "border-amber-500 text-amber-600 bg-amber-50";
// // // // //     return "border-rose-500 text-rose-600 bg-rose-50";
// // // // //   };

// // // // //   return (
// // // // //     <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 font-sans">
// // // // //       <div className="max-w-6xl mx-auto space-y-8">
        
// // // // //         {/* Header Navigation Bar / Toggle */}
// // // // //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-200">
// // // // //           <div>
// // // // //             <div className="flex items-center gap-2">
              
              
// // // // //             </div>
// // // // //             <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
// // // // //               📄 Resume ATS Simulator
// // // // //             </h1>
// // // // //             <p className="text-slate-600 text-sm mt-1">
// // // // //               Simulate enterprise ATS filters, check section detections, identify missing keywords, and get AI resume optimization without fake skill hallucination.
// // // // //             </p>
// // // // //           </div>

// // // // //           <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
// // // // //             <button
// // // // //               onClick={() => navigate("/ai-match")}
// // // // //               className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition"
// // // // //             >
// // // // //               ⚡ Skill Matcher
// // // // //             </button>
// // // // //             <button
// // // // //               className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm"
// // // // //             >
// // // // //               📄 ATS Simulator
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* Top Controls Grid */}
// // // // //         <div className="grid lg:grid-cols-2 gap-8 items-start">
          
// // // // //           {/* LEFT: Resume Upload & Content Input */}
// // // // //           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
// // // // //             <div className="flex items-center justify-between">
// // // // //               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
// // // // //                 <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block" />
// // // // //                 1. Upload or Paste Resume
// // // // //               </h2>

// // // // //               <button
// // // // //                 type="button"
// // // // //                 onClick={loadPresetSample}
// // // // //                 className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-3 py-1.5 rounded-lg transition border border-indigo-200"
// // // // //               >
// // // // //                 + Load Sample Resume
// // // // //               </button>
// // // // //             </div>

// // // // //             {/* Resume Upload Box */}
// // // // //             <div>
// // // // //               <label className="block text-xs font-semibold text-slate-600 mb-2">
// // // // //                 Upload Resume File (PDF, DOCX, TXT)
// // // // //               </label>
// // // // //               <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-5 block text-center hover:border-indigo-400 hover:bg-indigo-50/40 transition">
// // // // //                 <input
// // // // //                   type="file"
// // // // //                   accept=".pdf,.doc,.docx,.txt"
// // // // //                   hidden
// // // // //                   onChange={handleFileUpload}
// // // // //                 />
// // // // //                 <p className="text-sm font-medium text-slate-700">
// // // // //                   {resumeFileName ? `📄 ${resumeFileName}` : "Click to Upload Resume File"}
// // // // //                 </p>
// // // // //                 <p className="text-xs text-slate-400 mt-1">
// // // // //                   Or paste raw resume text below
// // // // //                 </p>
// // // // //               </label>
// // // // //             </div>

// // // // //             {/* Resume Text Input */}
// // // // //             <div>
// // // // //               <label className="block text-xs font-semibold text-slate-600 mb-1.5">
// // // // //                 Resume Content / Plain Text
// // // // //               </label>
// // // // //               <textarea
// // // // //                 rows="7"
// // // // //                 value={resumeText}
// // // // //                 onChange={(e) => setResumeText(e.target.value)}
// // // // //                 placeholder="Paste your complete resume text here (Education, Experience, Projects, Skills, Contact Info)..."
// // // // //                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none font-mono text-xs"
// // // // //               />
// // // // //             </div>

// // // // //             {/* Target Job Selector */}
// // // // //             <div className="pt-4 border-t border-slate-100 space-y-4">
// // // // //               <div className="flex justify-between items-center">
// // // // //                 <h3 className="text-sm font-bold text-slate-900">
// // // // //                   Select Target Job Position
// // // // //                 </h3>

// // // // //                 <div className="flex gap-2 text-xs font-semibold">
// // // // //                   <button
// // // // //                     type="button"
// // // // //                     onClick={() => setUseCustomJob(false)}
// // // // //                     className={`px-3 py-1 rounded-md transition ${
// // // // //                       !useCustomJob
// // // // //                         ? "bg-indigo-600 text-white"
// // // // //                         : "bg-slate-100 text-slate-600 hover:bg-slate-200"
// // // // //                     }`}
// // // // //                   >
// // // // //                     Portal Jobs
// // // // //                   </button>
// // // // //                   <button
// // // // //                     type="button"
// // // // //                     onClick={() => setUseCustomJob(true)}
// // // // //                     className={`px-3 py-1 rounded-md transition ${
// // // // //                       useCustomJob
// // // // //                         ? "bg-indigo-600 text-white"
// // // // //                         : "bg-slate-100 text-slate-600 hover:bg-slate-200"
// // // // //                     }`}
// // // // //                   >
// // // // //                     Custom Job
// // // // //                   </button>
// // // // //                 </div>
// // // // //               </div>

// // // // //               {!useCustomJob ? (
// // // // //                 <select
// // // // //                   value={selectedJobId}
// // // // //                   onChange={(e) => setSelectedJobId(e.target.value)}
// // // // //                   className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
// // // // //                 >
// // // // //                   {jobs.map((job) => (
// // // // //                     <option key={job._id} value={job._id}>
// // // // //                       {job.title} — {job.companyId?.name || "Company"} ({job.location})
// // // // //                     </option>
// // // // //                   ))}
// // // // //                 </select>
// // // // //               ) : (
// // // // //                 <div className="space-y-3">
// // // // //                   <input
// // // // //                     type="text"
// // // // //                     value={customJobTitle}
// // // // //                     onChange={(e) => setCustomJobTitle(e.target.value)}
// // // // //                     placeholder="Job Title (e.g. Senior MERN Stack Developer)"
// // // // //                     className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
// // // // //                   />
// // // // //                   <textarea
// // // // //                     rows="3"
// // // // //                     value={customJobDescription}
// // // // //                     onChange={(e) => setCustomJobDescription(e.target.value)}
// // // // //                     placeholder="Job description / required tech stack (React, Node, MongoDB, Docker)..."
// // // // //                     className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 resize-none"
// // // // //                   />
// // // // //                 </div>
// // // // //               )}
// // // // //             </div>

// // // // //             <button
// // // // //               onClick={handleAnalyzeATS}
// // // // //               disabled={loading}
// // // // //               className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md"
// // // // //             >
// // // // //               {loading ? "Scanning ATS Filters..." : "🔍 Run ATS Resume Scan"}
// // // // //             </button>
// // // // //           </div>

// // // // //           {/* RIGHT: ATS SCORE & SECTION DETECTIONS OUTPUT */}
// // // // //           <div className="space-y-6">
// // // // //             {!atsResult ? (
// // // // //               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 space-y-4">
// // // // //                 <div className="text-6xl">📊</div>
// // // // //                 <h3 className="text-lg font-bold text-slate-700">
// // // // //                   ATS Simulator Dashboard
// // // // //                 </h3>
// // // // //                 <p className="text-xs text-slate-500 max-w-sm mx-auto">
// // // // //                   Click <strong>"Load Sample Resume"</strong> or upload your resume, then run ATS Scan to view your ATS score card, section checklists, missing keywords, and AI suggestions.
// // // // //                 </p>
// // // // //               </div>
// // // // //             ) : (
// // // // //               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 font-mono text-sm">
                
// // // // //                 {/* ATS SCORE BOX */}
// // // // //                 <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-inner">
// // // // //                   <div className="flex items-center justify-between">
// // // // //                     <div>
// // // // //                       <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
// // // // //                         ATS SCORE
// // // // //                       </span>
// // // // //                       <div className="text-slate-300 text-xs mt-1">
// // // // //                         ──────────────
// // // // //                       </div>
// // // // //                     </div>
                    
// // // // //                     {/* Score display matching exact layout format */}
// // // // //                     <div className="text-right">
// // // // //                       <div className="text-4xl font-extrabold text-amber-400 font-mono">
// // // // //                         {atsResult.atsScore}/100
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 {/* ATS Checklist Items */}
// // // // //                 <div className="space-y-3 pt-2">
// // // // //                   <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
// // // // //                     <span>✓</span>
// // // // //                     <span>Skills detected</span>
// // // // //                   </div>
// // // // //                   {atsResult.detectedSkills.length > 0 && (
// // // // //                     <div className="flex flex-wrap gap-1.5 pl-5">
// // // // //                       {atsResult.detectedSkills.map((s, i) => (
// // // // //                         <span key={i} className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded border border-emerald-200 font-sans">
// // // // //                           {s}
// // // // //                         </span>
// // // // //                       ))}
// // // // //                     </div>
// // // // //                   )}

// // // // //                   <div className={`flex items-center gap-2 font-semibold text-sm ${atsResult.sections.hasEducation ? 'text-emerald-700' : 'text-slate-400'}`}>
// // // // //                     <span>{atsResult.sections.hasEducation ? '✓' : '✗'}</span>
// // // // //                     <span>Education detected</span>
// // // // //                   </div>

// // // // //                   <div className={`flex items-center gap-2 font-semibold text-sm ${atsResult.sections.hasProjects ? 'text-emerald-700' : 'text-slate-400'}`}>
// // // // //                     <span>{atsResult.sections.hasProjects ? '✓' : '✗'}</span>
// // // // //                     <span>Projects detected</span>
// // // // //                   </div>

// // // // //                   {/* Warning Flags */}
// // // // //                   <div className="pt-2 space-y-2">
// // // // //                     <div className="text-amber-700 font-semibold text-sm flex items-center gap-1.5">
// // // // //                       <span>⚠</span>
// // // // //                       <span>Missing keywords:</span>
// // // // //                     </div>
                    
// // // // //                     <div className="pl-6 space-y-1 text-slate-700 text-xs font-sans">
// // // // //                       {atsResult.missingKeywords.length > 0 ? (
// // // // //                         atsResult.missingKeywords.map((kw, i) => (
// // // // //                           <div key={i} className="flex items-center gap-2 text-rose-700 font-medium">
// // // // //                             <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
// // // // //                             {kw}
// // // // //                           </div>
// // // // //                         ))
// // // // //                       ) : (
// // // // //                         <div className="text-emerald-600 font-medium">None detected! Key skills present.</div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   {/* Resume length check flag */}
// // // // //                   <div className="pt-2">
// // // // //                     {atsResult.isTooLong ? (
// // // // //                       <div className="text-amber-700 font-semibold text-sm flex items-center gap-1.5">
// // // // //                         <span>⚠</span>
// // // // //                         <span>Resume too long ({atsResult.wordCount} words - recommend keeping under 600)</span>
// // // // //                       </div>
// // // // //                     ) : (
// // // // //                       <div className="text-emerald-700 font-semibold text-sm flex items-center gap-1.5">
// // // // //                         <span>✓</span>
// // // // //                         <span>Optimal length ({atsResult.wordCount} words)</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>

// // // // //                   <div className={`flex items-center gap-2 font-semibold text-sm ${atsResult.sections.hasContact ? 'text-emerald-700' : 'text-amber-700'}`}>
// // // // //                     <span>{atsResult.sections.hasContact ? '✓' : '⚠'}</span>
// // // // //                     <span>Contact information detected</span>
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 {/* STEP 2: Optimize Button */}
// // // // //                 <div className="pt-4 border-t border-slate-200">
// // // // //                   <button
// // // // //                     onClick={handleOptimizeForJob}
// // // // //                     disabled={optimizing}
// // // // //                     className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md font-sans"
// // // // //                   >
// // // // //                     {optimizing ? "Generating AI Suggestions..." : "✨ Optimize my resume for this job"}
// // // // //                   </button>
// // // // //                 </div>

// // // // //               </div>
// // // // //             )}

// // // // //           </div>

// // // // //         </div>

// // // // //         {/* STEP 3: AI SUGGESTIONS & OPTIMIZATION OUTPUT */}
// // // // //         {optimizationResult && (
// // // // //           <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-6 sm:p-8 space-y-6 font-sans">
            
// // // // //             <div className="flex items-center justify-between border-b pb-4 border-indigo-100">
// // // // //               <div>
// // // // //                 <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
// // // // //                   AI Recommendation Engine
// // // // //                 </span>
// // // // //                 <h3 className="text-xl font-extrabold text-slate-900 mt-2">
// // // // //                   AI Resume Optimization Suggestions
// // // // //                 </h3>
// // // // //               </div>

// // // // //               <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 p-2.5 rounded-lg max-w-xs">
// // // // //                 <strong>Important:</strong> System does not invent fake skills; only rephrases genuine experience.
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Comparison Grid */}
// // // // //             <div className="grid md:grid-cols-2 gap-6">
              
// // // // //               <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
// // // // //                 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
// // // // //                   📌 Job Requires:
// // // // //                 </h4>
// // // // //                 <div className="flex flex-wrap gap-2">
// // // // //                   {(optimizationResult.jobRequires || ["React", "Node", "MongoDB", "Docker"]).map((req, i) => (
// // // // //                     <span key={i} className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-md">
// // // // //                       {req}
// // // // //                     </span>
// // // // //                   ))}
// // // // //                 </div>
// // // // //               </div>

// // // // //               <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
// // // // //                 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
// // // // //                   📝 Your Resume Contains:
// // // // //                 </h4>
// // // // //                 <div className="flex flex-wrap gap-2">
// // // // //                   {(optimizationResult.yourResumeContains || ["React", "Node", "MongoDB"]).map((contain, i) => (
// // // // //                     <span key={i} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md">
// // // // //                       {contain}
// // // // //                     </span>
// // // // //                   ))}
// // // // //                 </div>
// // // // //               </div>

// // // // //             </div>

// // // // //             {/* Suggested Improvement Banner */}
// // // // //             <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
// // // // //               <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
// // // // //                 💡 Suggested Improvement:
// // // // //               </h4>
// // // // //               <p className="text-sm font-semibold text-amber-800">
// // // // //                 {optimizationResult.suggestedImprovement || "Add Docker project experience if applicable."}
// // // // //               </p>
// // // // //             </div>

// // // // //             {/* Genuine Experience Actionable Bullet Points */}
// // // // //             {optimizationResult.bulletPointImprovements && (
// // // // //               <div className="space-y-3 pt-2">
// // // // //                 <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
// // // // //                   <span className="w-2 h-2 rounded-full bg-indigo-600" />
// // // // //                   ATS Action Verb & Impact Phrasing Suggestions (Genuine Experience)
// // // // //                 </h4>

// // // // //                 <div className="space-y-2">
// // // // //                   {optimizationResult.bulletPointImprovements.map((tip, idx) => (
// // // // //                     <div key={idx} className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
// // // // //                       <span className="text-indigo-600 font-bold">#{idx + 1}</span>
// // // // //                       <span className="leading-relaxed font-medium">{tip}</span>
// // // // //                     </div>
// // // // //                   ))}
// // // // //                 </div>
// // // // //               </div>
// // // // //             )}

// // // // //           </div>
// // // // //         )}

// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default ResumeATSSimulator;





// // // // import React, { useState, useContext, useEffect } from "react";
// // // // import { useLocation, useNavigate } from "react-router-dom";
// // // // import axios from "axios";
// // // // import { toast } from "react-toastify";
// // // // import { AppContext } from "../context/AppContext";
// // // // import { analyzeResumeATS as localAnalyzeATS } from "../utils/clientSkillMatcher";

// // // // const ResumeATSSimulator = () => {
// // // //   const { jobs = [], backendUrl } = useContext(AppContext);
// // // //   const location = useLocation();
// // // //   const navigate = useNavigate();

// // // //   const [selectedJobId, setSelectedJobId] = useState("");
// // // //   const [customJobTitle, setCustomJobTitle] = useState("");
// // // //   const [customJobDescription, setCustomJobDescription] = useState("");
// // // //   const [useCustomJob, setUseCustomJob] = useState(false);

// // // //   const [resumeText, setResumeText] = useState("");
// // // //   const [resumeFileName, setResumeFileName] = useState("");
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [optimizing, setOptimizing] = useState(false);

// // // //   const [atsResult, setAtsResult] = useState(null);
// // // //   const [optimizationResult, setOptimizationResult] = useState(null);

// // // //   // Default sample resume for demo testing
// // // //   const sampleResume = `
// // // // Rahul Sharma
// // // // Email: rahul.sharma@example.com | Phone: +91 9876543210
// // // // LinkedIn: linkedin.com/in/rahul-sharma | GitHub: github.com/rahul-sharma

// // // // EDUCATION
// // // // B.Tech in Computer Science & Engineering - XYZ University (2020 - 2024)

// // // // TECHNICAL SKILLS
// // // // Languages & Frameworks: React, JavaScript, Node.js, HTML5, CSS3, Express.js, MongoDB, TailwindCSS, SQL.
// // // // Tools & Platforms: Git, GitHub, VS Code, Postman.

// // // // PROJECTS
// // // // 1. E-Commerce Web Application (React, Node, MongoDB)
// // // // - Built a full-stack e-commerce web app using React, Express, Node.js, and MongoDB.
// // // // - Implemented user authentication, shopping cart management, and payment gateway integration.
// // // // - Designed responsive user interface components with TailwindCSS.

// // // // 2. Job Portal & Candidate Matching System
// // // // - Developed a web application for job seekers and recruiters using MERN stack.
// // // // - Implemented resume text parsing and skill keyword matching algorithm.

// // // // EXPERIENCE
// // // // Frontend Developer Intern | TechSolutions Pvt Ltd (Jan 2024 - Jun 2024)
// // // // - Developed interactive React components for client dashboard.
// // // // - Integrated REST APIs with backend services and optimized page load performance.
// // // // `;

// // // //   useEffect(() => {
// // // //     const params = new URLSearchParams(location.search);
// // // //     const passedJobId = params.get("jobId") || location.state?.jobId;

// // // //     if (passedJobId) {
// // // //       setSelectedJobId(passedJobId);
// // // //     } else if (jobs.length > 0 && !selectedJobId) {
// // // //       setSelectedJobId(jobs[0]._id);
// // // //     }
// // // //   }, [jobs, location, selectedJobId]);

// // // //   // Upload resume text file
// // // //   const handleFileUpload = (e) => {
// // // //     const file = e.target.files?.[0];
// // // //     if (!file) return;

// // // //     if (file.size > 10 * 1024 * 1024) {
// // // //       toast.error("File size is too large (max 10MB)");
// // // //       e.target.value = "";
// // // //       return;
// // // //     }

// // // //     const extension = file.name.split(".").pop()?.toLowerCase();

// // // //     if (!["txt", "pdf", "doc", "docx"].includes(extension)) {
// // // //       toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
// // // //       e.target.value = "";
// // // //       return;
// // // //     }

// // // //     // FileReader.readAsText reliably supports plain-text files only.
// // // //     // PDF and DOCX need proper document parsing to extract their text.
// // // //     if (extension !== "txt") {
// // // //       toast.info(
// // // //         "For PDF/DOCX files, copy the resume text and paste it below. Direct document text extraction is not configured yet."
// // // //       );
// // // //       e.target.value = "";
// // // //       return;
// // // //     }

// // // //     setResumeFileName(file.name);

// // // //     const reader = new FileReader();

// // // //     reader.onload = (event) => {
// // // //       let text = String(event.target?.result || "")
// // // //         .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, " ")
// // // //         .replace(/[ \t]+/g, " ")
// // // //         .replace(/\n{3,}/g, "\n\n")
// // // //         .trim();

// // // //       if (text.length > 30000) {
// // // //         text = text.slice(0, 30000);
// // // //       }

// // // //       if (text.length < 10) {
// // // //         toast.warning("Could not extract enough text. Please paste your resume manually.");
// // // //       }

// // // //       setResumeText(text);
// // // //     };

// // // //     reader.onerror = () => {
// // // //       toast.error("Could not read the selected file.");
// // // //     };

// // // //     reader.readAsText(file);
// // // //   };

// // // //   const loadPresetSample = () => {
// // // //     setResumeText(sampleResume.trim());
// // // //     setResumeFileName("Sample_Resume.txt");
// // // //     setAtsResult(null);
// // // //     setOptimizationResult(null);
// // // //     toast.info("Sample MERN Stack Resume Loaded!");
// // // //   };

// // // //   // Analyze resume against the selected job
// // // //   const handleAnalyzeATS = async (e) => {
// // // //     if (e) e.preventDefault();

// // // //     if (!resumeText.trim()) {
// // // //       toast.error("Please enter or upload your resume content");
// // // //       return;
// // // //     }

// // // //     if (useCustomJob) {
// // // //       if (!customJobTitle.trim() || !customJobDescription.trim()) {
// // // //         toast.error("Please enter the custom job title and description");
// // // //         return;
// // // //       }
// // // //     } else if (!selectedJobId) {
// // // //       toast.error("Please select a target job");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setLoading(true);
// // // //       setAtsResult(null);
// // // //       setOptimizationResult(null);

// // // //       const targetJob = jobs.find((j) => j._id === selectedJobId);
// // // //       const safeResumeText = resumeText.trim().slice(0, 30000);

// // // //       const payload = useCustomJob
// // // //         ? {
// // // //             jobTitle: customJobTitle.trim(),
// // // //             jobDescription: customJobDescription.trim(),
// // // //             resumeText: safeResumeText,
// // // //           }
// // // //         : {
// // // //             jobId: selectedJobId,
// // // //             jobTitle: targetJob?.title || "",
// // // //             jobDescription: targetJob?.description || "",
// // // //             resumeText: safeResumeText,
// // // //           };

// // // //       let responseData = null;

// // // //       try {
// // // //         const { data } = await axios.post(
// // // //           `${backendUrl}/api/jobs/ats-analyze`,
// // // //           payload
// // // //         );
// // // //         responseData = data;
// // // //       } catch (err) {
// // // //         try {
// // // //           const { data } = await axios.post(
// // // //             `${backendUrl}/api/jobs/match`,
// // // //             payload
// // // //           );
// // // //           responseData = data;
// // // //         } catch (fallbackError) {
// // // //           console.warn(
// // // //             "Backend ATS endpoints unavailable; using local analysis:",
// // // //             fallbackError.message
// // // //           );

// // // //           responseData = localAnalyzeATS(
// // // //             safeResumeText,
// // // //             payload.jobDescription,
// // // //             payload.jobTitle
// // // //           );
// // // //         }
// // // //       }

// // // //       // Support APIs that return either { success, ... } or { success, data }
// // // //       const result = responseData?.data || responseData;

// // // //       if (
// // // //         responseData?.success !== false &&
// // // //         result &&
// // // //         (result.atsScore !== undefined || result.detectedSkills)
// // // //       ) {
// // // //         setAtsResult({
// // // //           ...result,
// // // //           atsScore: Number(result.atsScore ?? result.score ?? 0),
// // // //           detectedSkills: result.detectedSkills || result.matchedSkills || [],
// // // //           missingKeywords:
// // // //             result.missingKeywords || result.missingSkills || [],
// // // //           sections: {
// // // //             hasEducation: Boolean(result.sections?.hasEducation),
// // // //             hasProjects: Boolean(result.sections?.hasProjects),
// // // //             hasContact: Boolean(result.sections?.hasContact),
// // // //             ...(result.sections || {}),
// // // //           },
// // // //           wordCount:
// // // //             result.wordCount ??
// // // //             safeResumeText.split(/\s+/).filter(Boolean).length,
// // // //           isTooLong:
// // // //             result.isTooLong ??
// // // //             safeResumeText.split(/\s+/).filter(Boolean).length > 600,
// // // //         });

// // // //         toast.success("ATS Resume Scan Complete!");
// // // //       } else {
// // // //         toast.error(responseData?.message || "Failed to analyze resume");
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("ATS Scan Error:", error);
// // // //       toast.error(
// // // //         error.response?.data?.message || "Failed to calculate ATS score"
// // // //       );
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // Generate job-specific optimization suggestions
// // // //   const handleOptimizeForJob = async () => {
// // // //     if (!resumeText.trim()) {
// // // //       toast.error("Please enter or upload your resume content first");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setOptimizing(true);

// // // //       const targetJob = jobs.find((j) => j._id === selectedJobId);
// // // //       const safeResumeText = resumeText.trim().slice(0, 30000);

// // // //       const payload = {
// // // //         ...(useCustomJob
// // // //           ? {
// // // //               jobTitle: customJobTitle,
// // // //               jobDescription: customJobDescription,
// // // //             }
// // // //           : {
// // // //               jobId: selectedJobId,
// // // //               jobTitle: targetJob?.title || "",
// // // //               jobDescription: targetJob?.description || "",
// // // //             }),
// // // //         resumeText: safeResumeText,
// // // //         candidateSkills: atsResult?.detectedSkills || [],
// // // //         missingSkills: atsResult?.missingKeywords || [],
// // // //       };

// // // //       let responseData = null;

// // // //       try {
// // // //         const { data } = await axios.post(
// // // //           `${backendUrl}/api/jobs/ats-optimize`,
// // // //           payload
// // // //         );
// // // //         responseData = data;
// // // //       } catch (err) {
// // // //         if (err.response?.status === 404) {
// // // //           const requiredSkills = [
// // // //             ...(atsResult?.detectedSkills || []),
// // // //             ...(atsResult?.missingKeywords || []),
// // // //           ];

// // // //           responseData = {
// // // //             success: true,
// // // //             data: {
// // // //               jobRequires: requiredSkills,
// // // //               yourResumeContains: atsResult?.detectedSkills || [],
// // // //               suggestedImprovement:
// // // //                 atsResult?.missingKeywords?.length > 0
// // // //                   ? `Review the missing skills: ${atsResult.missingKeywords.join(
// // // //                       ", "
// // // //                     )}. Learn them and include them only when you have genuine experience.`
// // // //                   : "Highlight your relevant projects, technical skills, and measurable achievements.",
// // // //               bulletPointImprovements: [
// // // //                 "Use clear action verbs to explain what you personally built or improved.",
// // // //                 "Add measurable results where you have genuine figures to support them.",
// // // //                 "Highlight your relevant technical skills and project experience near the top of your resume.",
// // // //               ],
// // // //             },
// // // //           };
// // // //         } else {
// // // //           throw err;
// // // //         }
// // // //       }

// // // //       if (responseData?.success && responseData.data) {
// // // //         setOptimizationResult(responseData.data);
// // // //         toast.success("Resume Optimization Suggestions Generated!");
// // // //       } else {
// // // //         toast.error(
// // // //           responseData?.message || "Failed to generate optimization suggestions"
// // // //         );
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("AI Optimization Error:", error);
// // // //       toast.error(
// // // //         error.response?.data?.message || "Failed to get AI suggestions"
// // // //       );
// // // //     } finally {
// // // //       setOptimizing(false);
// // // //     }
// // // //   };

// // // //   // Open a YouTube search for the clicked missing skill
// // // //   const openSkillTutorial = (skill) => {
// // // //     const query = `${skill} tutorial for beginners`;
// // // //     const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
// // // //       query
// // // //     )}`;

// // // //     window.open(youtubeUrl, "_blank", "noopener,noreferrer");
// // // //   };

// // // //   return (
// // // //     <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 font-sans">
// // // //       <div className="max-w-6xl mx-auto space-y-8">
// // // //         {/* Header */}
// // // //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-200">
// // // //           <div>
// // // //             <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
// // // //               📄 Resume ATS Simulator
// // // //             </h1>

// // // //             <p className="text-slate-600 text-sm mt-1">
// // // //               Simulate ATS filters, detect resume sections, identify missing
// // // //               keywords, and get resume optimization suggestions.
// // // //             </p>
// // // //           </div>

// // // //           <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
// // // //             <button
// // // //               type="button"
// // // //               onClick={() => navigate("/ai-match")}
// // // //               className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition"
// // // //             >
// // // //               ⚡ Skill Matcher
// // // //             </button>

// // // //             <button
// // // //               type="button"
// // // //               className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm"
// // // //             >
// // // //               📄 ATS Simulator
// // // //             </button>
// // // //           </div>
// // // //         </div>

// // // //         {/* Main Controls */}
// // // //         <div className="grid lg:grid-cols-2 gap-8 items-start">
// // // //           {/* LEFT: Resume Input */}
// // // //           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
// // // //             <div className="flex items-center justify-between gap-3">
// // // //               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
// // // //                 <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block" />
// // // //                 1. Upload or Paste Resume
// // // //               </h2>

// // // //               <button
// // // //                 type="button"
// // // //                 onClick={loadPresetSample}
// // // //                 className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-3 py-1.5 rounded-lg transition border border-indigo-200"
// // // //               >
// // // //                 + Load Sample Resume
// // // //               </button>
// // // //             </div>

// // // //             {/* Upload */}
// // // //             <div>
// // // //               <label className="block text-xs font-semibold text-slate-600 mb-2">
// // // //                 Upload Resume File (TXT)
// // // //               </label>

// // // //               <label className="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-5 block text-center hover:border-indigo-400 hover:bg-indigo-50/40 transition">
// // // //                 <input
// // // //                   type="file"
// // // //                   accept=".txt,.pdf,.doc,.docx"
// // // //                   hidden
// // // //                   onChange={handleFileUpload}
// // // //                 />

// // // //                 <p className="text-sm font-medium text-slate-700">
// // // //                   {resumeFileName
// // // //                     ? `📄 ${resumeFileName}`
// // // //                     : "Click to Upload Resume File"}
// // // //                 </p>

// // // //                 <p className="text-xs text-slate-400 mt-1">
// // // //                   TXT is extracted directly; PDF/DOCX text can be pasted below
// // // //                 </p>
// // // //               </label>
// // // //             </div>

// // // //             {/* Resume Text */}
// // // //             <div>
// // // //               <label className="block text-xs font-semibold text-slate-600 mb-1.5">
// // // //                 Resume Content / Plain Text
// // // //               </label>

// // // //               <textarea
// // // //                 rows="7"
// // // //                 value={resumeText}
// // // //                 maxLength={30000}
// // // //                 onChange={(e) => setResumeText(e.target.value)}
// // // //                 placeholder="Paste your complete resume text here (Education, Experience, Projects, Skills, Contact Info)..."
// // // //                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none font-mono text-xs"
// // // //               />

// // // //               <p className="text-right text-xs text-slate-400 mt-1">
// // // //                 {resumeText.length}/30000 characters
// // // //               </p>
// // // //             </div>

// // // //             {/* Job Selector */}
// // // //             <div className="pt-4 border-t border-slate-100 space-y-4">
// // // //               <div className="flex flex-wrap justify-between items-center gap-3">
// // // //                 <h3 className="text-sm font-bold text-slate-900">
// // // //                   Select Target Job Position
// // // //                 </h3>

// // // //                 <div className="flex gap-2 text-xs font-semibold">
// // // //                   <button
// // // //                     type="button"
// // // //                     onClick={() => setUseCustomJob(false)}
// // // //                     className={`px-3 py-1 rounded-md transition ${
// // // //                       !useCustomJob
// // // //                         ? "bg-indigo-600 text-white"
// // // //                         : "bg-slate-100 text-slate-600 hover:bg-slate-200"
// // // //                     }`}
// // // //                   >
// // // //                     Portal Jobs
// // // //                   </button>

// // // //                   <button
// // // //                     type="button"
// // // //                     onClick={() => setUseCustomJob(true)}
// // // //                     className={`px-3 py-1 rounded-md transition ${
// // // //                       useCustomJob
// // // //                         ? "bg-indigo-600 text-white"
// // // //                         : "bg-slate-100 text-slate-600 hover:bg-slate-200"
// // // //                     }`}
// // // //                   >
// // // //                     Custom Job
// // // //                   </button>
// // // //                 </div>
// // // //               </div>

// // // //               {!useCustomJob ? (
// // // //                 <select
// // // //                   value={selectedJobId}
// // // //                   onChange={(e) => setSelectedJobId(e.target.value)}
// // // //                   className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
// // // //                 >
// // // //                   <option value="">-- Select a Job --</option>

// // // //                   {jobs.map((job) => (
// // // //                     <option key={job._id} value={job._id}>
// // // //                       {job.title} — {job.companyId?.name || "Company"} (
// // // //                       {job.location})
// // // //                     </option>
// // // //                   ))}
// // // //                 </select>
// // // //               ) : (
// // // //                 <div className="space-y-3">
// // // //                   <input
// // // //                     type="text"
// // // //                     value={customJobTitle}
// // // //                     onChange={(e) => setCustomJobTitle(e.target.value)}
// // // //                     placeholder="Job Title (e.g. MERN Stack Developer)"
// // // //                     className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
// // // //                   />

// // // //                   <textarea
// // // //                     rows="3"
// // // //                     value={customJobDescription}
// // // //                     onChange={(e) =>
// // // //                       setCustomJobDescription(e.target.value)
// // // //                     }
// // // //                     placeholder="Job description / required tech stack (React, Node, MongoDB, Docker)..."
// // // //                     className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 resize-none"
// // // //                   />
// // // //                 </div>
// // // //               )}

// // // //               {!useCustomJob && jobs.length === 0 && (
// // // //                 <p className="text-xs text-amber-600">
// // // //                   No portal jobs available. Select Custom Job to enter a job
// // // //                   description manually.
// // // //                 </p>
// // // //               )}
// // // //             </div>

// // // //             <button
// // // //               type="button"
// // // //               onClick={handleAnalyzeATS}
// // // //               disabled={loading}
// // // //               className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md"
// // // //             >
// // // //               {loading ? "Scanning ATS Filters..." : "🔍 Run ATS Resume Scan"}
// // // //             </button>
// // // //           </div>

// // // //           {/* RIGHT: ATS Results */}
// // // //           <div className="space-y-6">
// // // //             {!atsResult ? (
// // // //               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 space-y-4">
// // // //                 <div className="text-6xl">📊</div>

// // // //                 <h3 className="text-lg font-bold text-slate-700">
// // // //                   ATS Simulator Dashboard
// // // //                 </h3>

// // // //                 <p className="text-xs text-slate-500 max-w-sm mx-auto">
// // // //                   Load a sample resume or enter your own resume, then run ATS
// // // //                   Scan to view your score, detected sections, missing keywords,
// // // //                   and optimization suggestions.
// // // //                 </p>
// // // //               </div>
// // // //             ) : (
// // // //               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 font-mono text-sm">
// // // //                 {/* Score */}
// // // //                 <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-inner">
// // // //                   <div className="flex items-center justify-between gap-4">
// // // //                     <div>
// // // //                       <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
// // // //                         ATS SCORE
// // // //                       </span>

// // // //                       <div className="text-slate-300 text-xs mt-1">
// // // //                         Resume compatibility score
// // // //                       </div>
// // // //                     </div>

// // // //                     <div className="text-right">
// // // //                       <div
// // // //                         className={`text-4xl font-extrabold font-mono ${
// // // //                           atsResult.atsScore >= 80
// // // //                             ? "text-emerald-400"
// // // //                             : atsResult.atsScore >= 60
// // // //                             ? "text-amber-400"
// // // //                             : "text-rose-400"
// // // //                         }`}
// // // //                       >
// // // //                         {atsResult.atsScore}/100
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>

// // // //                   <div className="w-full bg-slate-700 rounded-full h-2 mt-5">
// // // //                     <div
// // // //                       className="bg-indigo-400 h-2 rounded-full transition-all"
// // // //                       style={{
// // // //                         width: `${Math.min(
// // // //                           100,
// // // //                           Math.max(0, atsResult.atsScore)
// // // //                         )}%`,
// // // //                       }}
// // // //                     />
// // // //                   </div>
// // // //                 </div>

// // // //                 {/* Detected Skills */}
// // // //                 <div className="space-y-3 pt-2">
// // // //                   <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
// // // //                     <span>✓</span>
// // // //                     <span>Skills detected</span>
// // // //                   </div>

// // // //                   {atsResult.detectedSkills.length > 0 ? (
// // // //                     <div className="flex flex-wrap gap-1.5 pl-5">
// // // //                       {atsResult.detectedSkills.map((skill, i) => (
// // // //                         <span
// // // //                           key={i}
// // // //                           className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded border border-emerald-200 font-sans"
// // // //                         >
// // // //                           {skill}
// // // //                         </span>
// // // //                       ))}
// // // //                     </div>
// // // //                   ) : (
// // // //                     <p className="pl-5 text-xs text-slate-400">
// // // //                       No matching skills detected.
// // // //                     </p>
// // // //                   )}

// // // //                   {/* Section Detection */}
// // // //                   <div
// // // //                     className={`flex items-center gap-2 font-semibold text-sm ${
// // // //                       atsResult.sections.hasEducation
// // // //                         ? "text-emerald-700"
// // // //                         : "text-slate-400"
// // // //                     }`}
// // // //                   >
// // // //                     <span>
// // // //                       {atsResult.sections.hasEducation ? "✓" : "✗"}
// // // //                     </span>
// // // //                     <span>Education detected</span>
// // // //                   </div>

// // // //                   <div
// // // //                     className={`flex items-center gap-2 font-semibold text-sm ${
// // // //                       atsResult.sections.hasProjects
// // // //                         ? "text-emerald-700"
// // // //                         : "text-slate-400"
// // // //                     }`}
// // // //                   >
// // // //                     <span>
// // // //                       {atsResult.sections.hasProjects ? "✓" : "✗"}
// // // //                     </span>
// // // //                     <span>Projects detected</span>
// // // //                   </div>

// // // //                   {/* Clickable Missing Skills */}
// // // //                   <div className="pt-3 border-t border-slate-100">
// // // //                     <div className="text-amber-700 font-semibold text-sm flex items-center gap-1.5">
// // // //                       <span>⚠</span>
// // // //                       <span>Missing Skills & Learning Resources</span>
// // // //                     </div>

// // // //                     <p className="text-slate-500 text-xs font-sans mt-1 mb-3">
// // // //                       Click any missing skill to find tutorials on YouTube.
// // // //                     </p>

// // // //                     <div className="space-y-2">
// // // //                       {atsResult.missingKeywords.length > 0 ? (
// // // //                         atsResult.missingKeywords.map((skill, i) => (
// // // //                           <button
// // // //                             key={`${skill}-${i}`}
// // // //                             type="button"
// // // //                             onClick={() => openSkillTutorial(skill)}
// // // //                             title={`Learn ${skill} on YouTube`}
// // // //                             className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 transition-all group text-left"
// // // //                           >
// // // //                             <span className="flex items-center gap-2 text-rose-700 font-semibold text-xs font-sans">
// // // //                               <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
// // // //                               {skill}
// // // //                             </span>

// // // //                             <span className="text-red-600 font-semibold text-xs group-hover:underline whitespace-nowrap">
// // // //                               ▶ Watch Tutorial
// // // //                             </span>
// // // //                           </button>
// // // //                         ))
// // // //                       ) : (
// // // //                         <div className="text-emerald-600 font-medium text-xs font-sans">
// // // //                           ✓ No missing keywords detected! Key skills present.
// // // //                         </div>
// // // //                       )}
// // // //                     </div>
// // // //                   </div>

// // // //                   {/* Resume Length */}
// // // //                   <div className="pt-2">
// // // //                     {atsResult.isTooLong ? (
// // // //                       <div className="text-amber-700 font-semibold text-sm flex items-center gap-1.5">
// // // //                         <span>⚠</span>
// // // //                         <span>
// // // //                           Resume too long ({atsResult.wordCount} words -
// // // //                           recommend keeping under 600)
// // // //                         </span>
// // // //                       </div>
// // // //                     ) : (
// // // //                       <div className="text-emerald-700 font-semibold text-sm flex items-center gap-1.5">
// // // //                         <span>✓</span>
// // // //                         <span>
// // // //                           Resume length: {atsResult.wordCount} words
// // // //                         </span>
// // // //                       </div>
// // // //                     )}
// // // //                   </div>

// // // //                   {/* Contact */}
// // // //                   <div
// // // //                     className={`flex items-center gap-2 font-semibold text-sm ${
// // // //                       atsResult.sections.hasContact
// // // //                         ? "text-emerald-700"
// // // //                         : "text-amber-700"
// // // //                     }`}
// // // //                   >
// // // //                     <span>
// // // //                       {atsResult.sections.hasContact ? "✓" : "⚠"}
// // // //                     </span>
// // // //                     <span>Contact information detected</span>
// // // //                   </div>
// // // //                 </div>

// // // //                 {/* Optimize */}
// // // //                 <div className="pt-4 border-t border-slate-200">
// // // //                   <button
// // // //                     type="button"
// // // //                     onClick={handleOptimizeForJob}
// // // //                     disabled={optimizing}
// // // //                     className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md font-sans"
// // // //                   >
// // // //                     {optimizing
// // // //                       ? "Generating Suggestions..."
// // // //                       : "✨ Optimize my resume for this job"}
// // // //                   </button>
// // // //                 </div>
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>

// // // //         {/* AI Optimization Results */}
// // // //         {optimizationResult && (
// // // //           <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-6 sm:p-8 space-y-6 font-sans">
// // // //             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-indigo-100">
// // // //               <div>
// // // //                 <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
// // // //                   AI Recommendation Engine
// // // //                 </span>

// // // //                 <h3 className="text-xl font-extrabold text-slate-900 mt-2">
// // // //                   AI Resume Optimization Suggestions
// // // //                 </h3>
// // // //               </div>

// // // //               <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 p-2.5 rounded-lg max-w-xs">
// // // //                 <strong>Important:</strong> Only include skills and experience
// // // //                 you genuinely have. Do not invent qualifications.
// // // //               </div>
// // // //             </div>

// // // //             {/* Skills Comparison */}
// // // //             <div className="grid md:grid-cols-2 gap-6">
// // // //               <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
// // // //                 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
// // // //                   📌 Job Requires
// // // //                 </h4>

// // // //                 <div className="flex flex-wrap gap-2">
// // // //                   {(optimizationResult.jobRequires || []).length > 0 ? (
// // // //                     optimizationResult.jobRequires.map((req, i) => (
// // // //                       <span
// // // //                         key={i}
// // // //                         className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-md"
// // // //                       >
// // // //                         {req}
// // // //                       </span>
// // // //                     ))
// // // //                   ) : (
// // // //                     <p className="text-xs text-slate-400">
// // // //                       No required skills provided.
// // // //                     </p>
// // // //                   )}
// // // //                 </div>
// // // //               </div>

// // // //               <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
// // // //                 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
// // // //                   📝 Your Resume Contains
// // // //                 </h4>

// // // //                 <div className="flex flex-wrap gap-2">
// // // //                   {(optimizationResult.yourResumeContains || []).length > 0 ? (
// // // //                     optimizationResult.yourResumeContains.map(
// // // //                       (skill, i) => (
// // // //                         <span
// // // //                           key={i}
// // // //                           className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md"
// // // //                         >
// // // //                           {skill}
// // // //                         </span>
// // // //                       )
// // // //                     )
// // // //                   ) : (
// // // //                     <p className="text-xs text-slate-400">
// // // //                       No matching skills provided.
// // // //                     </p>
// // // //                   )}
// // // //                 </div>
// // // //               </div>
// // // //             </div>

// // // //             {/* Suggested Improvement */}
// // // //             <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
// // // //               <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
// // // //                 💡 Suggested Improvement
// // // //               </h4>

// // // //               <p className="text-sm font-semibold text-amber-800">
// // // //                 {optimizationResult.suggestedImprovement ||
// // // //                   "Highlight relevant experience and skills that you genuinely possess."}
// // // //               </p>
// // // //             </div>

// // // //             {/* Bullet Point Improvements */}
// // // //             {optimizationResult.bulletPointImprovements?.length > 0 && (
// // // //               <div className="space-y-3 pt-2">
// // // //                 <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
// // // //                   <span className="w-2 h-2 rounded-full bg-indigo-600" />
// // // //                   ATS Action Verb & Impact Suggestions
// // // //                 </h4>

// // // //                 <div className="space-y-2">
// // // //                   {optimizationResult.bulletPointImprovements.map(
// // // //                     (tip, idx) => (
// // // //                       <div
// // // //                         key={idx}
// // // //                         className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5"
// // // //                       >
// // // //                         <span className="text-indigo-600 font-bold">
// // // //                           #{idx + 1}
// // // //                         </span>

// // // //                         <span className="leading-relaxed font-medium">
// // // //                           {tip}
// // // //                         </span>
// // // //                       </div>
// // // //                     )
// // // //                   )}
// // // //                 </div>
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default ResumeATSSimulator;



// // // import React, { useState, useContext, useEffect } from "react";
// // // import { useLocation, useNavigate } from "react-router-dom";
// // // import axios from "axios";
// // // import { toast } from "react-toastify";
// // // import { AppContext } from "../context/AppContext";
// // // import { analyzeResumeATS as localAnalyzeATS } from "../utils/clientSkillMatcher";

// // // const ResumeATSSimulator = () => {
// // //   const { jobs = [], backendUrl } = useContext(AppContext);
// // //   const location = useLocation();
// // //   const navigate = useNavigate();

// // //   const [selectedJobId, setSelectedJobId] = useState("");
// // //   const [customJobTitle, setCustomJobTitle] = useState("");
// // //   const [customJobDescription, setCustomJobDescription] = useState("");
// // //   const [useCustomJob, setUseCustomJob] = useState(false);

// // //   const [resumeText, setResumeText] = useState("");
// // //   const [resumeFileName, setResumeFileName] = useState("");
// // //   const [loading, setLoading] = useState(false);
// // //   const [optimizing, setOptimizing] = useState(false);
// // //   const [generatingResume, setGeneratingResume] = useState(false);

// // //   const [atsResult, setAtsResult] = useState(null);
// // //   const [optimizationResult, setOptimizationResult] = useState(null);
// // //   const [improvedResume, setImprovedResume] = useState("");

// // //   const targetJob = jobs.find((job) => job._id === selectedJobId);

// // //   useEffect(() => {
// // //     const params = new URLSearchParams(location.search);
// // //     const passedJobId = params.get("jobId") || location.state?.jobId;

// // //     if (passedJobId) {
// // //       setSelectedJobId(passedJobId);
// // //     } else if (jobs.length && !selectedJobId) {
// // //       setSelectedJobId(jobs[0]._id);
// // //     }
// // //   }, [jobs, location, selectedJobId]);

// // //   const getJobDetails = () => {
// // //     const title = useCustomJob
// // //       ? customJobTitle.trim()
// // //       : targetJob?.title || "";

// // //     const description = useCustomJob
// // //       ? customJobDescription.trim()
// // //       : targetJob?.description || "";

// // //     return { jobTitle: title, jobDescription: description };
// // //   };

// // //   const handleFileUpload = (event) => {
// // //     const file = event.target.files?.[0];
// // //     if (!file) return;

// // //     if (file.size > 10 * 1024 * 1024) {
// // //       toast.error("File size must be under 10 MB.");
// // //       event.target.value = "";
// // //       return;
// // //     }

// // //     const extension = file.name.split(".").pop()?.toLowerCase();

// // //     if (extension !== "txt") {
// // //       toast.info(
// // //         "Direct PDF/DOCX reading is not configured. Copy your resume text and paste it into the text box."
// // //       );
// // //       event.target.value = "";
// // //       return;
// // //     }

// // //     const reader = new FileReader();

// // //     reader.onload = (e) => {
// // //       const text = String(e.target?.result || "")
// // //         .replace(/\r/g, "")
// // //         .slice(0, 30000)
// // //         .trim();

// // //       setResumeText(text);
// // //       setResumeFileName(file.name);
// // //       setAtsResult(null);
// // //       setOptimizationResult(null);
// // //       setImprovedResume("");

// // //       if (text.length < 10) {
// // //         toast.warning("Please check the text extracted from your file.");
// // //       } else {
// // //         toast.success("Resume text loaded!");
// // //       }
// // //     };

// // //     reader.onerror = () => toast.error("Could not read this file.");
// // //     reader.readAsText(file);
// // //   };

// // //   const loadSampleResume = () => {
// // //     const sample = `Rahul Sharma
// // // Email: rahul.sharma@example.com
// // // Phone: +91 9876543210
// // // LinkedIn: linkedin.com/in/rahul-sharma
// // // GitHub: github.com/rahul-sharma

// // // EDUCATION
// // // B.Tech in Computer Science and Engineering - XYZ University (2020-2024)

// // // TECHNICAL SKILLS
// // // React, JavaScript, Node.js, HTML5, CSS3, Express.js, MongoDB,
// // // Tailwind CSS, SQL, Git, GitHub, VS Code, Postman.

// // // PROJECTS
// // // E-Commerce Web Application
// // // - Built a full-stack e-commerce application using React, Express, Node.js and MongoDB.
// // // - Implemented user authentication and shopping cart management.
// // // - Created responsive UI components using Tailwind CSS.

// // // Job Portal and Candidate Matching System
// // // - Developed a job portal for job seekers and recruiters using the MERN stack.
// // // - Implemented resume text parsing and skill keyword matching.

// // // EXPERIENCE
// // // Frontend Developer Intern | TechSolutions Pvt Ltd (Jan 2024 - Jun 2024)
// // // - Developed interactive React components for a client dashboard.
// // // - Integrated REST APIs with backend services.`;

// // //     setResumeText(sample);
// // //     setResumeFileName("Sample_Resume.txt");
// // //     setAtsResult(null);
// // //     setOptimizationResult(null);
// // //     setImprovedResume("");
// // //     toast.info("Sample resume loaded.");
// // //   };

// // //   const handleAnalyzeATS = async () => {
// // //     if (!resumeText.trim()) {
// // //       toast.error("Please upload or paste your resume first.");
// // //       return;
// // //     }

// // //     const { jobTitle, jobDescription } = getJobDetails();

// // //     if (!jobTitle || !jobDescription) {
// // //       toast.error("Please select a job or enter a custom job title and description.");
// // //       return;
// // //     }

// // //     try {
// // //       setLoading(true);
// // //       setAtsResult(null);
// // //       setOptimizationResult(null);
// // //       setImprovedResume("");

// // //       const payload = {
// // //         jobId: useCustomJob ? undefined : selectedJobId,
// // //         jobTitle,
// // //         jobDescription,
// // //         resumeText: resumeText.trim().slice(0, 30000),
// // //       };

// // //       let data;

// // //       try {
// // //         const response = await axios.post(
// // //           `${backendUrl}/api/jobs/ats-analyze`,
// // //           payload
// // //         );
// // //         data = response.data;
// // //       } catch (error) {
// // //         try {
// // //           const response = await axios.post(
// // //             `${backendUrl}/api/jobs/match`,
// // //             payload
// // //           );
// // //           data = response.data;
// // //         } catch {
// // //           data = localAnalyzeATS(
// // //             payload.resumeText,
// // //             jobDescription,
// // //             jobTitle
// // //           );
// // //         }
// // //       }

// // //       const result = data?.data || data;

// // //       if (
// // //         data?.success === false ||
// // //         !result ||
// // //         (result.atsScore === undefined && result.score === undefined)
// // //       ) {
// // //         throw new Error(data?.message || "ATS analysis failed.");
// // //       }

// // //       const detectedSkills =
// // //         result.detectedSkills || result.matchedSkills || [];

// // //       const missingKeywords =
// // //         result.missingKeywords || result.missingSkills || [];

// // //       setAtsResult({
// // //         ...result,
// // //         atsScore: Math.max(
// // //           0,
// // //           Math.min(100, Number(result.atsScore ?? result.score ?? 0))
// // //         ),
// // //         detectedSkills,
// // //         missingKeywords,
// // //         sections: {
// // //           hasEducation: Boolean(
// // //             result.sections?.hasEducation ??
// // //               /\beducation\b/i.test(payload.resumeText)
// // //           ),
// // //           hasProjects: Boolean(
// // //             result.sections?.hasProjects ??
// // //               /\bprojects?\b/i.test(payload.resumeText)
// // //           ),
// // //           hasContact: Boolean(
// // //             result.sections?.hasContact ??
// // //               /@|phone|linkedin|github/i.test(payload.resumeText)
// // //           ),
// // //         },
// // //         wordCount:
// // //           result.wordCount ??
// // //           payload.resumeText.split(/\s+/).filter(Boolean).length,
// // //         isTooLong:
// // //           result.isTooLong ??
// // //           payload.resumeText.split(/\s+/).filter(Boolean).length > 600,
// // //       });

// // //       toast.success("ATS scan completed!");
// // //     } catch (error) {
// // //       console.error("ATS scan error:", error);
// // //       toast.error(
// // //         error.response?.data?.message ||
// // //           error.message ||
// // //           "Failed to analyze resume."
// // //       );
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleOptimizeForJob = async () => {
// // //     if (!atsResult) {
// // //       toast.error("Run the ATS scan first.");
// // //       return;
// // //     }

// // //     const { jobTitle, jobDescription } = getJobDetails();

// // //     try {
// // //       setOptimizing(true);

// // //       const { data } = await axios.post(
// // //         `${backendUrl}/api/jobs/ats-optimize`,
// // //         {
// // //           jobTitle,
// // //           jobDescription,
// // //           resumeText: resumeText.trim().slice(0, 30000),
// // //           candidateSkills: atsResult.detectedSkills || [],
// // //           missingSkills: atsResult.missingKeywords || [],
// // //         }
// // //       );

// // //       if (!data?.success || !data.data) {
// // //         throw new Error(data?.message || "Could not generate suggestions.");
// // //       }

// // //       setOptimizationResult(data.data);
// // //       toast.success("Optimization suggestions generated!");
// // //     } catch (error) {
// // //       console.error("Resume optimization error:", error);
// // //       toast.error(
// // //         error.response?.data?.message ||
// // //           error.message ||
// // //           "Failed to generate suggestions."
// // //       );
// // //     } finally {
// // //       setOptimizing(false);
// // //     }
// // //   };

// // //   const handleGenerateResume = async () => {
// // //     if (!atsResult || !resumeText.trim()) {
// // //       toast.error("Run the ATS scan before generating your new resume.");
// // //       return;
// // //     }

// // //     const { jobTitle, jobDescription } = getJobDetails();

// // //     if (!jobTitle || !jobDescription) {
// // //       toast.error("Please select a job with a description.");
// // //       return;
// // //     }

// // //     try {
// // //       setGeneratingResume(true);
// // //       setImprovedResume("");

// // //       const { data } = await axios.post(
// // //         `${backendUrl}/api/jobs/ats-generate-resume`,
// // //         {
// // //           jobTitle,
// // //           jobDescription,
// // //           resumeText: resumeText.trim().slice(0, 30000),
// // //           candidateSkills: atsResult.detectedSkills || [],
// // //           missingSkills: atsResult.missingKeywords || [],
// // //         }
// // //       );

// // //       if (!data?.success || !data.resumeText) {
// // //         throw new Error(data?.message || "Resume generation failed.");
// // //       }

// // //       setImprovedResume(data.resumeText);
// // //       toast.success("Your improved resume is ready!");
// // //     } catch (error) {
// // //       console.error("Generate resume error:", error);
// // //       toast.error(
// // //         error.response?.data?.message ||
// // //           error.message ||
// // //           "Could not generate the resume. Check the backend and try again."
// // //       );
// // //     } finally {
// // //       setGeneratingResume(false);
// // //     }
// // //   };

// // //   const openSkillTutorial = (skill) => {
// // //     const query = encodeURIComponent(`${skill} tutorial for beginners`);
// // //     window.open(
// // //       `https://www.youtube.com/results?search_query=${query}`,
// // //       "_blank",
// // //       "noopener,noreferrer"
// // //     );
// // //   };

// // //   const downloadResumeAsPdf = () => {
// // //     if (!improvedResume.trim()) {
// // //       toast.error("Generate your improved resume first.");
// // //       return;
// // //     }

// // //     const printWindow = window.open("", "_blank");

// // //     if (!printWindow) {
// // //       toast.error("Please allow pop-ups to print or save your resume.");
// // //       return;
// // //     }

// // //     const escapeHtml = (value) =>
// // //       value.replace(/[&<>"']/g, (char) => {
// // //         const entities = {
// // //           "&": "&amp;",
// // //           "<": "&lt;",
// // //           ">": "&gt;",
// // //           '"': "&quot;",
// // //           "'": "&#39;",
// // //         };
// // //         return entities[char];
// // //       });

// // //     printWindow.document.write(`
// // //       <!DOCTYPE html>
// // //       <html>
// // //         <head>
// // //           <title>Improved Resume</title>
// // //           <meta charset="UTF-8" />
// // //           <style>
// // //             @page { size: A4; margin: 18mm; }
// // //             body {
// // //               font-family: Arial, Helvetica, sans-serif;
// // //               color: #111827;
// // //               font-size: 11pt;
// // //               line-height: 1.5;
// // //             }
// // //             pre {
// // //               font-family: Arial, Helvetica, sans-serif;
// // //               white-space: pre-wrap;
// // //               overflow-wrap: anywhere;
// // //               margin: 0;
// // //             }
// // //             h1 {
// // //               font-size: 18pt;
// // //               margin-bottom: 18px;
// // //             }
// // //             @media print {
// // //               body { print-color-adjust: exact; }
// // //             }
// // //           </style>
// // //         </head>
// // //         <body>
// // //           <h1>Improved Resume</h1>
// // //           <pre>${escapeHtml(improvedResume)}</pre>
// // //           <script>
// // //             window.onload = function () {
// // //               window.focus();
// // //               window.print();
// // //             };
// // //           </script>
// // //         </body>
// // //       </html>
// // //     `);

// // //     printWindow.document.close();
// // //   };

// // //   const scoreColor =
// // //     (atsResult?.atsScore ?? 0) >= 80
// // //       ? "text-emerald-400"
// // //       : (atsResult?.atsScore ?? 0) >= 60
// // //       ? "text-amber-400"
// // //       : "text-rose-400";

// // //   return (
// // //     <div className="min-h-screen bg-slate-50 px-4 py-10 font-sans sm:px-6">
// // //       <div className="mx-auto max-w-6xl space-y-8">
// // //         <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
// // //           <div>
// // //             <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
// // //               Resume ATS Simulator
// // //             </h1>
// // //             <p className="mt-2 text-sm text-slate-600">
// // //               Check your ATS score, learn missing skills, and generate a job-targeted resume.
// // //             </p>
// // //           </div>

// // //           <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
// // //             <button
// // //               type="button"
// // //               onClick={() => navigate("/ai-match")}
// // //               className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
// // //             >
// // //               Skill Matcher
// // //             </button>
// // //             <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
// // //               ATS Simulator
// // //             </span>
// // //           </div>
// // //         </header>

// // //         <div className="grid items-start gap-8 lg:grid-cols-2">
// // //           <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
// // //             <div className="flex flex-wrap items-center justify-between gap-3">
// // //               <h2 className="text-lg font-bold text-slate-900">
// // //                 1. Upload or Paste Resume
// // //               </h2>
// // //               <button
// // //                 type="button"
// // //                 onClick={loadSampleResume}
// // //                 className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
// // //               >
// // //                 Load Sample Resume
// // //               </button>
// // //             </div>

// // //             <div>
// // //               <label className="mb-2 block text-xs font-semibold text-slate-600">
// // //                 Upload a TXT resume
// // //               </label>
// // //               <input
// // //                 type="file"
// // //                 accept=".txt"
// // //                 onChange={handleFileUpload}
// // //                 className="w-full rounded-xl border border-dashed border-slate-300 p-4 text-sm"
// // //               />
// // //               {resumeFileName && (
// // //                 <p className="mt-2 text-xs text-slate-500">{resumeFileName}</p>
// // //               )}
// // //             </div>

// // //             <div>
// // //               <label className="mb-2 block text-xs font-semibold text-slate-600">
// // //                 Resume Content
// // //               </label>
// // //               <textarea
// // //                 rows={12}
// // //                 maxLength={30000}
// // //                 value={resumeText}
// // //                 onChange={(event) => {
// // //                   setResumeText(event.target.value);
// // //                   setAtsResult(null);
// // //                   setOptimizationResult(null);
// // //                   setImprovedResume("");
// // //                 }}
// // //                 placeholder="Paste your resume text here..."
// // //                 className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
// // //               />
// // //               <p className="mt-1 text-right text-xs text-slate-400">
// // //                 {resumeText.length}/30000 characters
// // //               </p>
// // //             </div>

// // //             <div className="space-y-4 border-t border-slate-100 pt-4">
// // //               <div className="flex flex-wrap items-center justify-between gap-3">
// // //                 <h3 className="text-sm font-bold text-slate-900">
// // //                   2. Select Target Job
// // //                 </h3>
// // //                 <div className="flex gap-2">
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => setUseCustomJob(false)}
// // //                     className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
// // //                       !useCustomJob
// // //                         ? "bg-indigo-600 text-white"
// // //                         : "bg-slate-100 text-slate-600"
// // //                     }`}
// // //                   >
// // //                     Portal Jobs
// // //                   </button>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => setUseCustomJob(true)}
// // //                     className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
// // //                       useCustomJob
// // //                         ? "bg-indigo-600 text-white"
// // //                         : "bg-slate-100 text-slate-600"
// // //                     }`}
// // //                   >
// // //                     Custom Job
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {!useCustomJob ? (
// // //                 <select
// // //                   value={selectedJobId}
// // //                   onChange={(event) => {
// // //                     setSelectedJobId(event.target.value);
// // //                     setAtsResult(null);
// // //                     setOptimizationResult(null);
// // //                     setImprovedResume("");
// // //                   }}
// // //                   className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
// // //                 >
// // //                   <option value="">-- Select a job --</option>
// // //                   {jobs.map((job) => (
// // //                     <option key={job._id} value={job._id}>
// // //                       {job.title} — {job.companyId?.name || "Company"}
// // //                     </option>
// // //                   ))}
// // //                 </select>
// // //               ) : (
// // //                 <div className="space-y-3">
// // //                   <input
// // //                     value={customJobTitle}
// // //                     onChange={(event) => setCustomJobTitle(event.target.value)}
// // //                     placeholder="Job title"
// // //                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
// // //                   />
// // //                   <textarea
// // //                     rows={4}
// // //                     value={customJobDescription}
// // //                     onChange={(event) =>
// // //                       setCustomJobDescription(event.target.value)
// // //                     }
// // //                     placeholder="Paste the complete job description and required skills..."
// // //                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
// // //                   />
// // //                 </div>
// // //               )}
// // //             </div>

// // //             <button
// // //               type="button"
// // //               onClick={handleAnalyzeATS}
// // //               disabled={loading}
// // //               className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-60"
// // //             >
// // //               {loading ? "Scanning Resume..." : "Run ATS Resume Scan"}
// // //             </button>
// // //           </section>

// // //           <section className="space-y-6">
// // //             {!atsResult ? (
// // //               <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
// // //                 <div className="text-5xl">📊</div>
// // //                 <h3 className="mt-4 text-lg font-bold text-slate-800">
// // //                   ATS Results Dashboard
// // //                 </h3>
// // //                 <p className="mt-2 text-sm text-slate-500">
// // //                   Run an ATS scan to see your score, detected skills, and missing keywords.
// // //                 </p>
// // //               </div>
// // //             ) : (
// // //               <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
// // //                 <div className="rounded-xl bg-slate-900 p-6 text-white">
// // //                   <div className="flex items-center justify-between gap-4">
// // //                     <div>
// // //                       <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
// // //                         ATS Compatibility Score
// // //                       </p>
// // //                       <p className="mt-1 text-xs text-slate-300">
// // //                         Based on the analysis result
// // //                       </p>
// // //                     </div>
// // //                     <span className={`text-4xl font-extrabold ${scoreColor}`}>
// // //                       {atsResult.atsScore}/100
// // //                     </span>
// // //                   </div>
// // //                   <div className="mt-5 h-2 rounded-full bg-slate-700">
// // //                     <div
// // //                       className="h-2 rounded-full bg-indigo-400"
// // //                       style={{ width: `${atsResult.atsScore}%` }}
// // //                     />
// // //                   </div>
// // //                 </div>

// // //                 <div>
// // //                   <h3 className="mb-3 text-sm font-bold text-emerald-700">
// // //                     ✓ Skills Detected
// // //                   </h3>
// // //                   <div className="flex flex-wrap gap-2">
// // //                     {atsResult.detectedSkills.length ? (
// // //                       atsResult.detectedSkills.map((skill, index) => (
// // //                         <span
// // //                           key={`${skill}-${index}`}
// // //                           className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800"
// // //                         >
// // //                           {skill}
// // //                         </span>
// // //                       ))
// // //                     ) : (
// // //                       <p className="text-xs text-slate-500">
// // //                         No matching skills detected.
// // //                       </p>
// // //                     )}
// // //                   </div>
// // //                 </div>

// // //                 <div className="space-y-2">
// // //                   {[
// // //                     ["Education detected", atsResult.sections.hasEducation],
// // //                     ["Projects detected", atsResult.sections.hasProjects],
// // //                     ["Contact details detected", atsResult.sections.hasContact],
// // //                   ].map(([label, present]) => (
// // //                     <p
// // //                       key={label}
// // //                       className={`text-sm font-semibold ${
// // //                         present ? "text-emerald-700" : "text-amber-700"
// // //                       }`}
// // //                     >
// // //                       {present ? "✓" : "⚠"} {label}
// // //                     </p>
// // //                   ))}
// // //                 </div>

// // //                 <div className="border-t border-slate-100 pt-4">
// // //                   <h3 className="text-sm font-bold text-amber-700">
// // //                     Missing Skills & YouTube Tutorials
// // //                   </h3>
// // //                   <p className="mb-3 mt-1 text-xs text-slate-500">
// // //                     Click a skill to find beginner tutorials.
// // //                   </p>
// // //                   <div className="space-y-2">
// // //                     {atsResult.missingKeywords.length ? (
// // //                       atsResult.missingKeywords.map((skill, index) => (
// // //                         <button
// // //                           type="button"
// // //                           key={`${skill}-${index}`}
// // //                           onClick={() => openSkillTutorial(skill)}
// // //                           className="flex w-full items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50 p-3 text-left hover:bg-rose-100"
// // //                         >
// // //                           <span className="text-xs font-semibold text-rose-700">
// // //                             {skill}
// // //                           </span>
// // //                           <span className="whitespace-nowrap text-xs font-bold text-indigo-700">
// // //                             ▶ Watch Tutorial
// // //                           </span>
// // //                         </button>
// // //                       ))
// // //                     ) : (
// // //                       <p className="text-xs font-medium text-emerald-700">
// // //                         No missing keywords detected.
// // //                       </p>
// // //                     )}
// // //                   </div>
// // //                 </div>

// // //                 <div className="text-sm text-slate-600">
// // //                   Resume length: {atsResult.wordCount} words
// // //                   {atsResult.isTooLong && (
// // //                     <span className="ml-2 text-amber-700">
// // //                       (Consider shortening it)
// // //                     </span>
// // //                   )}
// // //                 </div>

// // //                 <div className="space-y-3 border-t border-slate-200 pt-4">
// // //                   <button
// // //                     type="button"
// // //                     onClick={handleOptimizeForJob}
// // //                     disabled={optimizing}
// // //                     className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
// // //                   >
// // //                     {optimizing
// // //                       ? "Generating Suggestions..."
// // //                       : "Get AI Optimization Suggestions"}
// // //                   </button>

// // //                   <button
// // //                     type="button"
// // //                     onClick={handleGenerateResume}
// // //                     disabled={generatingResume}
// // //                     className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
// // //                   >
// // //                     {generatingResume
// // //                       ? "Generating Your New Resume..."
// // //                       : "✨ Generate My New Resume"}
// // //                   </button>
// // //                   <p className="text-xs leading-relaxed text-slate-500">
// // //                     AI will improve your wording and highlight relevant existing experience.
// // //                     It must not invent missing skills or qualifications.
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </section>
// // //         </div>

// // //         {optimizationResult && (
// // //           <section className="space-y-5 rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm sm:p-8">
// // //             <h2 className="text-xl font-extrabold text-slate-900">
// // //               AI Resume Optimization Suggestions
// // //             </h2>

// // //             <div className="grid gap-5 md:grid-cols-2">
// // //               <div className="rounded-xl bg-slate-50 p-5">
// // //                 <h3 className="mb-3 text-sm font-bold text-slate-700">
// // //                   Job Requires
// // //                 </h3>
// // //                 <div className="flex flex-wrap gap-2">
// // //                   {(optimizationResult.jobRequires || []).map((skill, i) => (
// // //                     <span
// // //                       key={`${skill}-${i}`}
// // //                       className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white"
// // //                     >
// // //                       {skill}
// // //                     </span>
// // //                   ))}
// // //                 </div>
// // //               </div>

// // //               <div className="rounded-xl bg-slate-50 p-5">
// // //                 <h3 className="mb-3 text-sm font-bold text-slate-700">
// // //                   Your Resume Contains
// // //                 </h3>
// // //                 <div className="flex flex-wrap gap-2">
// // //                   {(optimizationResult.yourResumeContains || []).map(
// // //                     (skill, i) => (
// // //                       <span
// // //                         key={`${skill}-${i}`}
// // //                         className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white"
// // //                       >
// // //                         {skill}
// // //                       </span>
// // //                     )
// // //                   )}
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4">
// // //               <h3 className="text-sm font-bold text-amber-900">
// // //                 Suggested Improvement
// // //               </h3>
// // //               <p className="mt-1 text-sm text-amber-800">
// // //                 {optimizationResult.suggestedImprovement}
// // //               </p>
// // //             </div>

// // //             {(optimizationResult.bulletPointImprovements || []).map(
// // //               (tip, index) => (
// // //                 <p
// // //                   key={index}
// // //                   className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950"
// // //                 >
// // //                   <strong>Tip {index + 1}:</strong> {tip}
// // //                 </p>
// // //               )
// // //             )}
// // //           </section>
// // //         )}

// // //         {improvedResume && (
// // //           <section className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg sm:p-8">
// // //             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
// // //               <div>
// // //                 <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
// // //                   Resume Generated
// // //                 </span>
// // //                 <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
// // //                   Your Improved Resume
// // //                 </h2>
// // //                 <p className="mt-1 text-sm text-slate-500">
// // //                   Review every detail before using it for an application.
// // //                 </p>
// // //               </div>

// // //               <button
// // //                 type="button"
// // //                 onClick={downloadResumeAsPdf}
// // //                 className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
// // //               >
// // //                 Download / Save as PDF
// // //               </button>
// // //             </div>

// // //             <textarea
// // //               value={improvedResume}
// // //               onChange={(event) => setImprovedResume(event.target.value)}
// // //               rows={24}
// // //               className="w-full rounded-xl border border-slate-200 bg-slate-50 p-5 font-mono text-sm leading-relaxed text-slate-800 outline-none focus:border-indigo-500"
// // //               aria-label="Preview and edit improved resume"
// // //             />

// // //             <p className="text-xs leading-relaxed text-slate-500">
// // //               PDF save karne ke liye button click karo. Print dialog mein
// // //               destination ke andar “Save as PDF” select karke Save karna.
// // //               Missing skills ko apni actual knowledge ke bina resume mein add mat karna.
// // //             </p>
// // //           </section>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ResumeATSSimulator;


// // import React, { useState, useContext, useEffect, useMemo } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { toast } from "react-toastify";
// // import { AppContext } from "../context/AppContext";
// // import { analyzeResumeATS as localAnalyzeATS } from "../utils/clientSkillMatcher";

// // // ==========================================
// // // RESUME PARSER
// // // Converts AI-generated plain text into sections
// // // ==========================================
// // const parseResume = (text = "") => {
// //   const lines = text
// //     .replace(/\r/g, "")
// //     .split("\n")
// //     .map((line) => line.trim())
// //     .filter(Boolean);

// //   const headingPatterns = [
// //     { name: "Professional Summary", regex: /^(professional summary|summary|career objective|profile|about me)$/i },
// //     { name: "Technical Skills", regex: /^(technical skills|skills|key skills|core competencies|technical expertise)$/i },
// //     { name: "Work Experience", regex: /^(work experience|professional experience|experience|employment history|internship experience)$/i },
// //     { name: "Projects", regex: /^(projects|personal projects|academic projects|key projects)$/i },
// //     { name: "Education", regex: /^(education|academic background|educational qualifications)$/i },
// //     { name: "Certifications", regex: /^(certifications|certificates|courses|licenses)$/i },
// //     { name: "Achievements", regex: /^(achievements|awards|accomplishments)$/i },
// //     { name: "Additional Information", regex: /^(additional information|languages|interests|activities)$/i },
// //   ];

// //   const sections = [];
// //   let currentSection = null;
// //   let name = "";
// //   const contact = [];

// //   const isHeading = (line) => {
// //     const clean = line.replace(/[:#*]/g, "").trim();
// //     return headingPatterns.find((item) => item.regex.test(clean));
// //   };

// //   const isContact = (line) =>
// //     /@|(\+?\d[\d\s()-]{7,}\d)|linkedin\.com|github\.com|portfolio|https?:\/\/|^location\s*:/i.test(line);

// //   // Find the candidate's name from the original AI output
// //   const nameIndex = lines.findIndex(
// //     (line) => !isHeading(line) && !isContact(line)
// //   );

// //   if (nameIndex !== -1) {
// //     name = lines[nameIndex]
// //       .replace(/^[#*\s]+|[*\s]+$/g, "")
// //       .replace(/^(name\s*:\s*)/i, "")
// //       .trim();

// //     if (/^(professional summary|technical skills|work experience|projects|education)$/i.test(name)) {
// //       name = "";
// //     }
// //   }

// //   lines.forEach((line, index) => {
// //     if (index === nameIndex) return;

// //     if (isContact(line)) {
// //       contact.push(line.replace(/^[|•·,\s]+|[|•·,\s]+$/g, ""));
// //       return;
// //     }

// //     const heading = isHeading(line);

// //     if (heading) {
// //       currentSection = {
// //         title: heading.name,
// //         content: [],
// //       };
// //       sections.push(currentSection);
// //       return;
// //     }

// //     if (!currentSection) {
// //       currentSection = {
// //         title: "Professional Summary",
// //         content: [],
// //       };
// //       sections.push(currentSection);
// //     }

// //     const cleaned = line
// //       .replace(/^#{1,6}\s*/, "")
// //       .replace(/^\*\*(.*?)\*\*$/, "$1")
// //       .trim();

// //     if (cleaned) {
// //       currentSection.content.push(cleaned);
// //     }
// //   });

// //   return {
// //     name,
// //     contact: [...new Set(contact)],
// //     sections: sections.filter((section) => section.content.length > 0),
// //   };
// // };
// // // ==========================================
// // // MERGE ORIGINAL RESUME DETAILS WITH AI RESUME
// // // ==========================================
// // const mergeResumeDetails = (originalText, generatedText) => {
// //   const original = parseResume(originalText);
// //   const generated = parseResume(generatedText);

// //   // Preserve original contact details
// //   const contact = [
// //     ...new Set([
// //       ...original.contact,
// //       ...generated.contact,
// //     ]),
// //   ];

// //   // Preserve original name if AI misses it
// //   const name = original.name || generated.name;

// //   // Keep all original section information
// //   // and add AI improvements without exact duplicates
// //   const sectionsMap = new Map();

// //   [...original.sections, ...generated.sections].forEach((section) => {
// //     const key = section.title.toLowerCase();

// //     if (!sectionsMap.has(key)) {
// //       sectionsMap.set(key, {
// //         title: section.title,
// //         content: [],
// //       });
// //     }

// //     const existing = sectionsMap.get(key);

// //     section.content.forEach((item) => {
// //       if (
// //         !existing.content.some(
// //           (oldItem) =>
// //             oldItem.toLowerCase() === item.toLowerCase()
// //         )
// //       ) {
// //         existing.content.push(item);
// //       }
// //     });
// //   });

// //   return {
// //     name,
// //     contact,
// //     sections: Array.from(sectionsMap.values()),
// //   };
// // };
// // // ==========================================
// // // RESUME HTML FOR PDF
// // // ==========================================
// // const escapeHtml = (value = "") =>
// //   String(value).replace(/[&<>"']/g, (char) => {
// //     const entities = {
// //       "&": "&amp;",
// //       "<": "&lt;",
// //       ">": "&gt;",
// //       '"': "&quot;",
// //       "'": "&#39;",
// //     };
// //     return entities[char];
// //   });

// // const createResumeHtml = (resume) => {
// //   const contactHtml = resume.contact
// //     .map((item) => `<span>${escapeHtml(item)}</span>`)
// //     .join('<span class="separator">|</span>');

// //   const sectionsHtml = resume.sections
// //     .map((section) => {
// //       const content = section.content
// //         .map((item) => {
// //           const isBullet = /^[-•*▪]\s*/.test(item);

// //           if (isBullet) {
// //             return `<li>${escapeHtml(item.replace(/^[-•*▪]\s*/, ""))}</li>`;
// //           }

// //           return `<p>${escapeHtml(item)}</p>`;
// //         })
// //         .join("");

// //       const hasBullets = section.content.some((item) =>
// //         /^[-•*▪]\s*/.test(item)
// //       );

// //       return `
// //         <section class="resume-section">
// //           <h2>${escapeHtml(section.title)}</h2>
// //           ${hasBullets ? `<ul>${content}</ul>` : content}
// //         </section>
// //       `;
// //     })
// //     .join("");

// //   return `
// //     <!DOCTYPE html>
// //     <html>
// //     <head>
// //       <meta charset="UTF-8" />
// //       <title>Professional Resume</title>
// //       <style>
// //         @page {
// //           size: A4;
// //           margin: 14mm 17mm;
// //         }

// //         * {
// //           box-sizing: border-box;
// //         }

// //         body {
// //           margin: 0;
// //           padding: 0;
// //           font-family: Arial, Helvetica, sans-serif;
// //           color: #263445;
// //           font-size: 10pt;
// //           line-height: 1.5;
// //         }

// //         .resume-header {
// //           text-align: center;
// //           padding-bottom: 16px;
// //           border-bottom: 2px solid #1e40af;
// //           margin-bottom: 20px;
// //         }

// //         h1 {
// //           color: #172554;
// //           font-size: 25pt;
// //           margin: 0 0 9px;
// //           font-weight: 800;
// //           text-transform: uppercase;
// //           letter-spacing: 1px;
// //         }

// //         .contact {
// //           display: flex;
// //           justify-content: center;
// //           flex-wrap: wrap;
// //           gap: 5px 9px;
// //           color: #475569;
// //           font-size: 9pt;
// //         }

// //         .separator {
// //           color: #94a3b8;
// //         }

// //         .resume-section {
// //           margin-bottom: 17px;
// //           break-inside: auto;
// //         }

// //         h2 {
// //           color: #1e40af;
// //           font-size: 11pt;
// //           text-transform: uppercase;
// //           letter-spacing: 0.8px;
// //           border-bottom: 1px solid #cbd5e1;
// //           padding-bottom: 5px;
// //           margin: 0 0 9px;
// //           break-after: avoid;
// //         }

// //         p {
// //           margin: 4px 0;
// //           text-align: justify;
// //         }

// //         ul {
// //           padding-left: 19px;
// //           margin: 5px 0;
// //         }

// //         li {
// //           padding-left: 3px;
// //           margin-bottom: 5px;
// //           text-align: justify;
// //         }

// //         @media print {
// //           body {
// //             print-color-adjust: exact;
// //             -webkit-print-color-adjust: exact;
// //           }
// //         }
// //       </style>
// //     </head>

// //     <body>
// //       <header class="resume-header">
// //         <h1>${escapeHtml(resume.name || "NAME NOT PROVIDED")}</h1>
// //         <div class="contact">${contactHtml}</div>
// //       </header>

// //       ${sectionsHtml}
// //     </body>
// //     </html>
// //   `;
// // };

// // // ==========================================
// // // MAIN COMPONENT
// // // ==========================================
// // const ResumeATSSimulator = () => {
// //   const { jobs = [], backendUrl } = useContext(AppContext);
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   const [selectedJobId, setSelectedJobId] = useState("");
// //   const [customJobTitle, setCustomJobTitle] = useState("");
// //   const [customJobDescription, setCustomJobDescription] = useState("");
// //   const [useCustomJob, setUseCustomJob] = useState(false);

// //   const [resumeText, setResumeText] = useState("");
// //   const [resumeFileName, setResumeFileName] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [optimizing, setOptimizing] = useState(false);
// //   const [generatingResume, setGeneratingResume] = useState(false);

// //   const [atsResult, setAtsResult] = useState(null);
// //   const [optimizationResult, setOptimizationResult] = useState(null);
// //   const [improvedResume, setImprovedResume] = useState("");

// //   const targetJob = jobs.find((job) => job._id === selectedJobId);

// //   // Parse the AI response into a professional resume
// //   const formattedResume = useMemo(
// //     () => parseResume(improvedResume),
// //     [improvedResume]
// //   );

// //   useEffect(() => {
// //     const params = new URLSearchParams(location.search);
// //     const passedJobId = params.get("jobId") || location.state?.jobId;

// //     if (passedJobId) {
// //       setSelectedJobId(passedJobId);
// //     } else if (jobs.length && !selectedJobId) {
// //       setSelectedJobId(jobs[0]._id);
// //     }
// //   }, [jobs, location, selectedJobId]);

// //   const getJobDetails = () => ({
// //     jobTitle: useCustomJob
// //       ? customJobTitle.trim()
// //       : targetJob?.title || "",
// //     jobDescription: useCustomJob
// //       ? customJobDescription.trim()
// //       : targetJob?.description || "",
// //   });

// //   const resetResults = () => {
// //     setAtsResult(null);
// //     setOptimizationResult(null);
// //     setImprovedResume("");
// //   };

// //   // ==========================================
// //   // FILE UPLOAD
// //   // ==========================================
// //   const handleFileUpload = (event) => {
// //     const file = event.target.files?.[0];
// //     if (!file) return;

// //     if (file.size > 10 * 1024 * 1024) {
// //       toast.error("File size must be under 10 MB.");
// //       event.target.value = "";
// //       return;
// //     }

// //     const extension = file.name.split(".").pop()?.toLowerCase();

// //     if (extension !== "txt") {
// //       toast.info(
// //         "Direct PDF/DOCX reading is not configured. Copy your resume text and paste it into the text box."
// //       );
// //       event.target.value = "";
// //       return;
// //     }

// //     const reader = new FileReader();

// //     reader.onload = (e) => {
// //       const text = String(e.target?.result || "")
// //         .replace(/\r/g, "")
// //         .slice(0, 30000)
// //         .trim();

// //       setResumeText(text);
// //       setResumeFileName(file.name);
// //       resetResults();

// //       if (text.length < 10) {
// //         toast.warning("Please check the text extracted from your file.");
// //       } else {
// //         toast.success("Resume text loaded!");
// //       }
// //     };

// //     reader.onerror = () => toast.error("Could not read this file.");
// //     reader.readAsText(file);
// //   };

// //   // ==========================================
// //   // SAMPLE RESUME
// //   // ==========================================
// //   const loadSampleResume = () => {
// //     const sample = `Rahul Sharma
// // Email: rahul.sharma@example.com
// // Phone: +91 9876543210
// // LinkedIn: linkedin.com/in/rahul-sharma
// // GitHub: github.com/rahul-sharma

// // PROFESSIONAL SUMMARY
// // Motivated software developer with experience in frontend development and full-stack application development.

// // EDUCATION
// // B.Tech in Computer Science and Engineering - XYZ University (2020-2024)

// // TECHNICAL SKILLS
// // Frontend Development:
// // - React
// // - JavaScript
// // - HTML5
// // - CSS3
// // Backend Development:
// // - Node.js
// // - Express.js
// // - MongoDB
// // - REST APIs
// // Tools:
// // - Git
// // - GitHub
// // - VS Code
// // - Postman

// // PROJECTS
// // E-Commerce Web Application
// // - Built a full-stack e-commerce application using React, Express, Node.js and MongoDB.
// // - Implemented user authentication and shopping cart management.
// // - Created responsive UI components using Tailwind CSS.

// // Job Portal and Candidate Matching System
// // - Developed a job portal for job seekers and recruiters using the MERN stack.
// // - Implemented resume text parsing and skill keyword matching.

// // WORK EXPERIENCE
// // Frontend Developer Intern | TechSolutions Pvt Ltd (Jan 2024 - Jun 2024)
// // - Developed interactive React components for a client dashboard.
// // - Integrated REST APIs with backend services.`;

// //     setResumeText(sample);
// //     setResumeFileName("Sample_Resume.txt");
// //     resetResults();
// //     toast.info("Sample resume loaded.");
// //   };

// //   // ==========================================
// //   // ATS ANALYSIS
// //   // ==========================================
// //   const handleAnalyzeATS = async () => {
// //     if (!resumeText.trim()) {
// //       toast.error("Please upload or paste your resume first.");
// //       return;
// //     }

// //     const { jobTitle, jobDescription } = getJobDetails();

// //     if (!jobTitle || !jobDescription) {
// //       toast.error("Please select a job or enter a custom job title and description.");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       resetResults();

// //       const payload = {
// //         jobId: useCustomJob ? undefined : selectedJobId,
// //         jobTitle,
// //         jobDescription,
// //         resumeText: resumeText.trim().slice(0, 30000),
// //       };

// //       let data;

// //       try {
// //         const response = await axios.post(
// //           `${backendUrl}/api/jobs/ats-analyze`,
// //           payload
// //         );
// //         data = response.data;
// //       } catch (error) {
// //         try {
// //           const response = await axios.post(
// //             `${backendUrl}/api/jobs/match`,
// //             payload
// //           );
// //           data = response.data;
// //         } catch {
// //           data = localAnalyzeATS(
// //             payload.resumeText,
// //             jobDescription,
// //             jobTitle
// //           );
// //         }
// //       }

// //       const result = data?.data || data;

// //       if (
// //         data?.success === false ||
// //         !result ||
// //         (result.atsScore === undefined && result.score === undefined)
// //       ) {
// //         throw new Error(data?.message || "ATS analysis failed.");
// //       }

// //       const detectedSkills =
// //         result.detectedSkills || result.matchedSkills || [];

// //       const missingKeywords =
// //         result.missingKeywords || result.missingSkills || [];

// //       const wordCount =
// //         result.wordCount ??
// //         payload.resumeText.split(/\s+/).filter(Boolean).length;

// //       setAtsResult({
// //         ...result,
// //         atsScore: Math.max(
// //           0,
// //           Math.min(100, Number(result.atsScore ?? result.score ?? 0))
// //         ),
// //         detectedSkills,
// //         missingKeywords,
// //         sections: {
// //           hasEducation: Boolean(
// //             result.sections?.hasEducation ??
// //               /\beducation\b/i.test(payload.resumeText)
// //           ),
// //           hasProjects: Boolean(
// //             result.sections?.hasProjects ??
// //               /\bprojects?\b/i.test(payload.resumeText)
// //           ),
// //           hasContact: Boolean(
// //             result.sections?.hasContact ??
// //               /@|phone|linkedin|github/i.test(payload.resumeText)
// //           ),
// //         },
// //         wordCount,
// //         isTooLong:
// //           result.isTooLong ?? wordCount > 600,
// //       });

// //       toast.success("ATS scan completed!");
// //     } catch (error) {
// //       console.error("ATS scan error:", error);
// //       toast.error(
// //         error.response?.data?.message ||
// //           error.message ||
// //           "Failed to analyze resume."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ==========================================
// //   // AI OPTIMIZATION
// //   // ==========================================
// //   const handleOptimizeForJob = async () => {
// //     if (!atsResult) {
// //       toast.error("Run the ATS scan first.");
// //       return;
// //     }

// //     const { jobTitle, jobDescription } = getJobDetails();

// //     try {
// //       setOptimizing(true);

// //       const { data } = await axios.post(
// //         `${backendUrl}/api/jobs/ats-optimize`,
// //         {
// //           jobTitle,
// //           jobDescription,
// //           resumeText: resumeText.trim().slice(0, 30000),
// //           candidateSkills: atsResult.detectedSkills || [],
// //           missingSkills: atsResult.missingKeywords || [],
// //         }
// //       );

// //       if (!data?.success || !data.data) {
// //         throw new Error(data?.message || "Could not generate suggestions.");
// //       }

// //       setOptimizationResult(data.data);
// //       toast.success("Optimization suggestions generated!");
// //     } catch (error) {
// //       console.error("Resume optimization error:", error);
// //       toast.error(
// //         error.response?.data?.message ||
// //           error.message ||
// //           "Failed to generate suggestions."
// //       );
// //     } finally {
// //       setOptimizing(false);
// //     }
// //   };

// //   // ==========================================
// //   // GENERATE IMPROVED RESUME
// //   // ==========================================
// //   const handleGenerateResume = async () => {
// //     if (!atsResult || !resumeText.trim()) {
// //       toast.error("Run the ATS scan before generating your new resume.");
// //       return;
// //     }

// //     const { jobTitle, jobDescription } = getJobDetails();

// //     if (!jobTitle || !jobDescription) {
// //       toast.error("Please select a job with a description.");
// //       return;
// //     }

// //     try {
// //       setGeneratingResume(true);
// //       setImprovedResume("");

// //       const { data } = await axios.post(
// //         `${backendUrl}/api/jobs/ats-generate-resume`,
// //         {
// //           jobTitle,
// //           jobDescription,
// //           resumeText: resumeText.trim().slice(0, 30000),
// //           candidateSkills: atsResult.detectedSkills || [],
// //           missingSkills: atsResult.missingKeywords || [],
// //         }
// //       );

// //       // Support both response formats from the backend
// //       const generated =
// //         data?.data?.resumeText ||
// //         data?.resumeText ||
// //         data?.data?.resume ||
// //         "";

// //       if (!data?.success || !generated.trim()) {
// //         throw new Error(data?.message || "Resume generation failed.");
// //       }

// //       setImprovedResume(generated.trim());
// //       toast.success("Your professional resume is ready!");
// //     } catch (error) {
// //       console.error("Generate resume error:", error);
// //       toast.error(
// //         error.response?.data?.message ||
// //           error.message ||
// //           "Could not generate the resume. Check the backend and try again."
// //       );
// //     } finally {
// //       setGeneratingResume(false);
// //     }
// //   };

// //   // ==========================================
// //   // YOUTUBE SKILL TUTORIAL
// //   // ==========================================
// //   const openSkillTutorial = (skill) => {
// //     const query = encodeURIComponent(`${skill} tutorial for beginners`);
// //     window.open(
// //       `https://www.youtube.com/results?search_query=${query}`,
// //       "_blank",
// //       "noopener,noreferrer"
// //     );
// //   };

// //   // ==========================================
// //   // DOWNLOAD PROFESSIONAL PDF
// //   // ==========================================
// //   const downloadResumeAsPdf = () => {
// //     if (!improvedResume.trim()) {
// //       toast.error("Generate your improved resume first.");
// //       return;
// //     }

// //     const printWindow = window.open("", "_blank");

// //     if (!printWindow) {
// //       toast.error("Please allow pop-ups to download your resume.");
// //       return;
// //     }

// //     printWindow.document.open();
// //     printWindow.document.write(createResumeHtml(formattedResume));
// //     printWindow.document.close();

// //     printWindow.onload = () => {
// //       printWindow.focus();
// //       printWindow.print();
// //     };
// //   };

// //   const scoreColor =
// //     (atsResult?.atsScore ?? 0) >= 80
// //       ? "text-emerald-400"
// //       : (atsResult?.atsScore ?? 0) >= 60
// //       ? "text-amber-400"
// //       : "text-rose-400";

// //   return (
// //     <div className="min-h-screen bg-slate-50 px-4 py-10 font-sans sm:px-6">
// //       <div className="mx-auto max-w-6xl space-y-8">

// //         {/* HEADER */}
// //         <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
// //           <div>
// //             <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
// //               Resume ATS Simulator
// //             </h1>
// //             <p className="mt-2 text-sm text-slate-600">
// //               Check your ATS score, learn missing skills, and generate a professional resume.
// //             </p>
// //           </div>

// //           <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
// //             <button
// //               type="button"
// //               onClick={() => navigate("/ai-match")}
// //               className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
// //             >
// //               Skill Matcher
// //             </button>
// //             <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
// //               ATS Simulator
// //             </span>
// //           </div>
// //         </header>

// //         <div className="grid items-start gap-8 lg:grid-cols-2">

// //           {/* LEFT: INPUT */}
// //           <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
// //             <div className="flex flex-wrap items-center justify-between gap-3">
// //               <h2 className="text-lg font-bold text-slate-900">
// //                 1. Upload or Paste Resume
// //               </h2>

// //               <button
// //                 type="button"
// //                 onClick={loadSampleResume}
// //                 className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
// //               >
// //                 Load Sample Resume
// //               </button>
// //             </div>

// //             <div>
// //               <label className="mb-2 block text-xs font-semibold text-slate-600">
// //                 Upload a TXT resume
// //               </label>

// //               <input
// //                 type="file"
// //                 accept=".txt"
// //                 onChange={handleFileUpload}
// //                 className="w-full rounded-xl border border-dashed border-slate-300 p-4 text-sm"
// //               />

// //               {resumeFileName && (
// //                 <p className="mt-2 text-xs text-slate-500">
// //                   {resumeFileName}
// //                 </p>
// //               )}
// //             </div>

// //             <div>
// //               <label className="mb-2 block text-xs font-semibold text-slate-600">
// //                 Resume Content
// //               </label>

// //               <textarea
// //                 rows={12}
// //                 maxLength={30000}
// //                 value={resumeText}
// //                 onChange={(event) => {
// //                   setResumeText(event.target.value);
// //                   resetResults();
// //                 }}
// //                 placeholder="Paste your resume text here..."
// //                 className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
// //               />

// //               <p className="mt-1 text-right text-xs text-slate-400">
// //                 {resumeText.length}/30000 characters
// //               </p>
// //             </div>

// //             {/* JOB SELECTION */}
// //             <div className="space-y-4 border-t border-slate-100 pt-4">
// //               <div className="flex flex-wrap items-center justify-between gap-3">
// //                 <h3 className="text-sm font-bold text-slate-900">
// //                   2. Select Target Job
// //                 </h3>

// //                 <div className="flex gap-2">
// //                   <button
// //                     type="button"
// //                     onClick={() => setUseCustomJob(false)}
// //                     className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
// //                       !useCustomJob
// //                         ? "bg-indigo-600 text-white"
// //                         : "bg-slate-100 text-slate-600"
// //                     }`}
// //                   >
// //                     Portal Jobs
// //                   </button>

// //                   <button
// //                     type="button"
// //                     onClick={() => setUseCustomJob(true)}
// //                     className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
// //                       useCustomJob
// //                         ? "bg-indigo-600 text-white"
// //                         : "bg-slate-100 text-slate-600"
// //                     }`}
// //                   >
// //                     Custom Job
// //                   </button>
// //                 </div>
// //               </div>

// //               {!useCustomJob ? (
// //                 <select
// //                   value={selectedJobId}
// //                   onChange={(event) => {
// //                     setSelectedJobId(event.target.value);
// //                     resetResults();
// //                   }}
// //                   className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
// //                 >
// //                   <option value="">-- Select a job --</option>

// //                   {jobs.map((job) => (
// //                     <option key={job._id} value={job._id}>
// //                       {job.title} — {job.companyId?.name || "Company"}
// //                     </option>
// //                   ))}
// //                 </select>
// //               ) : (
// //                 <div className="space-y-3">
// //                   <input
// //                     value={customJobTitle}
// //                     onChange={(event) => setCustomJobTitle(event.target.value)}
// //                     placeholder="Job title"
// //                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
// //                   />

// //                   <textarea
// //                     rows={4}
// //                     value={customJobDescription}
// //                     onChange={(event) =>
// //                       setCustomJobDescription(event.target.value)
// //                     }
// //                     placeholder="Paste the complete job description and required skills..."
// //                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
// //                   />
// //                 </div>
// //               )}
// //             </div>

// //             <button
// //               type="button"
// //               onClick={handleAnalyzeATS}
// //               disabled={loading}
// //               className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-60"
// //             >
// //               {loading ? "Scanning Resume..." : "Run ATS Resume Scan"}
// //             </button>
// //           </section>

// //           {/* RIGHT: ATS RESULTS */}
// //           <section className="space-y-6">
// //             {!atsResult ? (
// //               <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
// //                 <div className="text-5xl">📊</div>
// //                 <h3 className="mt-4 text-lg font-bold text-slate-800">
// //                   ATS Results Dashboard
// //                 </h3>
// //                 <p className="mt-2 text-sm text-slate-500">
// //                   Run an ATS scan to see your score, detected skills, and missing keywords.
// //                 </p>
// //               </div>
// //             ) : (
// //               <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

// //                 {/* SCORE */}
// //                 <div className="rounded-xl bg-slate-900 p-6 text-white">
// //                   <div className="flex items-center justify-between gap-4">
// //                     <div>
// //                       <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
// //                         ATS Compatibility Score
// //                       </p>
// //                       <p className="mt-1 text-xs text-slate-300">
// //                         Based on the analysis result
// //                       </p>
// //                     </div>

// //                     <span className={`text-4xl font-extrabold ${scoreColor}`}>
// //                       {atsResult.atsScore}/100
// //                     </span>
// //                   </div>

// //                   <div className="mt-5 h-2 rounded-full bg-slate-700">
// //                     <div
// //                       className="h-2 rounded-full bg-indigo-400"
// //                       style={{ width: `${atsResult.atsScore}%` }}
// //                     />
// //                   </div>
// //                 </div>

// //                 {/* DETECTED SKILLS */}
// //                 <div>
// //                   <h3 className="mb-3 text-sm font-bold text-emerald-700">
// //                     ✓ Skills Detected
// //                   </h3>

// //                   <div className="flex flex-wrap gap-2">
// //                     {atsResult.detectedSkills.length ? (
// //                       atsResult.detectedSkills.map((skill, index) => (
// //                         <span
// //                           key={`${skill}-${index}`}
// //                           className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800"
// //                         >
// //                           {skill}
// //                         </span>
// //                       ))
// //                     ) : (
// //                       <p className="text-xs text-slate-500">
// //                         No matching skills detected.
// //                       </p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 {/* SECTIONS */}
// //                 <div className="space-y-2">
// //                   {[
// //                     ["Education detected", atsResult.sections.hasEducation],
// //                     ["Projects detected", atsResult.sections.hasProjects],
// //                     ["Contact details detected", atsResult.sections.hasContact],
// //                   ].map(([label, present]) => (
// //                     <p
// //                       key={label}
// //                       className={`text-sm font-semibold ${
// //                         present ? "text-emerald-700" : "text-amber-700"
// //                       }`}
// //                     >
// //                       {present ? "✓" : "⚠"} {label}
// //                     </p>
// //                   ))}
// //                 </div>

// //                 {/* MISSING SKILLS */}
// //                 <div className="border-t border-slate-100 pt-4">
// //                   <h3 className="text-sm font-bold text-amber-700">
// //                     Missing Skills & YouTube Tutorials
// //                   </h3>

// //                   <p className="mb-3 mt-1 text-xs text-slate-500">
// //                     Click a skill to find beginner tutorials.
// //                   </p>

// //                   <div className="space-y-2">
// //                     {atsResult.missingKeywords.length ? (
// //                       atsResult.missingKeywords.map((skill, index) => (
// //                         <button
// //                           type="button"
// //                           key={`${skill}-${index}`}
// //                           onClick={() => openSkillTutorial(skill)}
// //                           className="flex w-full items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50 p-3 text-left hover:bg-rose-100"
// //                         >
// //                           <span className="text-xs font-semibold text-rose-700">
// //                             {skill}
// //                           </span>

// //                           <span className="whitespace-nowrap text-xs font-bold text-indigo-700">
// //                             ▶ Watch Tutorial
// //                           </span>
// //                         </button>
// //                       ))
// //                     ) : (
// //                       <p className="text-xs font-medium text-emerald-700">
// //                         No missing keywords detected.
// //                       </p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <div className="text-sm text-slate-600">
// //                   Resume length: {atsResult.wordCount} words

// //                   {atsResult.isTooLong && (
// //                     <span className="ml-2 text-amber-700">
// //                       (Consider shortening it)
// //                     </span>
// //                   )}
// //                 </div>

// //                 {/* AI BUTTONS */}
// //                 <div className="space-y-3 border-t border-slate-200 pt-4">
// //                   <button
// //                     type="button"
// //                     onClick={handleOptimizeForJob}
// //                     disabled={optimizing}
// //                     className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
// //                   >
// //                     {optimizing
// //                       ? "Generating Suggestions..."
// //                       : "Get AI Optimization Suggestions"}
// //                   </button>

// //                   <button
// //                     type="button"
// //                     onClick={handleGenerateResume}
// //                     disabled={generatingResume}
// //                     className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
// //                   >
// //                     {generatingResume
// //                       ? "Generating Your New Resume..."
// //                       : "✨ Generate My New Resume"}
// //                   </button>

// //                   <p className="text-xs leading-relaxed text-slate-500">
// //                     AI will improve your wording and highlight relevant existing experience.
// //                     It must not invent missing skills or qualifications.
// //                   </p>
// //                 </div>
// //               </div>
// //             )}
// //           </section>
// //         </div>

// //         {/* =====================================
// //             OPTIMIZATION SUGGESTIONS
// //         ===================================== */}
// //         {optimizationResult && (
// //           <section className="space-y-5 rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm sm:p-8">
// //             <h2 className="text-xl font-extrabold text-slate-900">
// //               AI Resume Optimization Suggestions
// //             </h2>

// //             <div className="grid gap-5 md:grid-cols-2">
// //               <div className="rounded-xl bg-slate-50 p-5">
// //                 <h3 className="mb-3 text-sm font-bold text-slate-700">
// //                   Job Requires
// //                 </h3>

// //                 <div className="flex flex-wrap gap-2">
// //                   {(optimizationResult.jobRequires || []).map((skill, i) => (
// //                     <span
// //                       key={`${skill}-${i}`}
// //                       className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white"
// //                     >
// //                       {skill}
// //                     </span>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="rounded-xl bg-slate-50 p-5">
// //                 <h3 className="mb-3 text-sm font-bold text-slate-700">
// //                   Your Resume Contains
// //                 </h3>

// //                 <div className="flex flex-wrap gap-2">
// //                   {(optimizationResult.yourResumeContains || []).map(
// //                     (skill, i) => (
// //                       <span
// //                         key={`${skill}-${i}`}
// //                         className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white"
// //                       >
// //                         {skill}
// //                       </span>
// //                     )
// //                   )}
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4">
// //               <h3 className="text-sm font-bold text-amber-900">
// //                 Suggested Improvement
// //               </h3>

// //               <p className="mt-1 text-sm text-amber-800">
// //                 {optimizationResult.suggestedImprovement}
// //               </p>
// //             </div>

// //             {(optimizationResult.bulletPointImprovements || []).map(
// //               (tip, index) => (
// //                 <p
// //                   key={index}
// //                   className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950"
// //                 >
// //                   <strong>Tip {index + 1}:</strong> {tip}
// //                 </p>
// //               )
// //             )}
// //           </section>
// //         )}

// //         {/* =====================================
// //             PROFESSIONAL RESUME PREVIEW
// //         ===================================== */}
// //         {improvedResume && (
// //           <section className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg sm:p-8">

// //             {/* TITLE AND DOWNLOAD */}
// //             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
// //               <div>
// //                 <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
// //                   ✓ Resume Generated
// //                 </span>

// //                 <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
// //                   Your Professional Resume
// //                 </h2>

// //                 <p className="mt-1 text-sm text-slate-500">
// //                   Your details are organized into a professional ATS-friendly layout.
// //                 </p>
// //               </div>

// //               <button
// //                 type="button"
// //                 onClick={downloadResumeAsPdf}
// //                 className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800"
// //               >
// //                 <span className="mr-2">⬇</span>
// //                 Download / Save as PDF
// //               </button>
// //             </div>

// //             {/* RESUME PAPER */}
// //             <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
// //               <div className="mx-auto min-h-[1056px] w-full max-w-[794px] bg-white px-7 py-10 shadow-xl sm:px-12 sm:py-12">

// //                 {/* NAME */}
// //                 <div className="border-b-2 border-blue-800 pb-5 text-center">
// //                   <h1 className="break-words text-2xl font-extrabold uppercase tracking-wide text-slate-900 sm:text-3xl">
// //                     {formattedResume.name || "Name not found"}
// //                   </h1>

// //                   {formattedResume.contact.length > 0 ? (
// //                     <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs text-slate-600">
// //                       {formattedResume.contact.map((item, index) => (
// //                         <span key={`${item}-${index}`}>
// //                           {item}
// //                         </span>
// //                       ))}
// //                     </div>
// //                   ) : (
// //                     <p className="mt-2 text-xs text-amber-600">
// //                       Contact details were not found in the original resume.
// //                     </p>
// //                   )}
// //                 </div>

// //                 {/* RESUME SECTIONS */}
// //                 <div className="mt-7 space-y-6">
// //                   {formattedResume.sections.map((section, index) => (
// //                     <div key={`${section.title}-${index}`}>
// //                       <h2 className="mb-3 border-b border-slate-300 pb-2 text-sm font-extrabold uppercase tracking-wider text-blue-800">
// //                         {section.title}
// //                       </h2>

// //                       <div className="space-y-2 text-sm leading-6 text-slate-700">
// //                         {section.content.map((item, itemIndex) => {
// //                           const isBullet = /^[-•*▪]\s*/.test(item);
// //                           const cleanItem = item.replace(/^[-•*▪]\s*/, "");

// //                           if (isBullet) {
// //                             return (
// //                               <div
// //                                 key={itemIndex}
// //                                 className="flex items-start gap-2"
// //                               >
// //                                 <span className="mt-0.5 text-blue-800">•</span>
// //                                 <p className="min-w-0 flex-1">
// //                                   {cleanItem}
// //                                 </p>
// //                               </div>
// //                             );
// //                           }

// //                           return (
// //                             <p
// //                               key={itemIndex}
// //                               className="whitespace-pre-wrap"
// //                             >
// //                               {item}
// //                             </p>
// //                           );
// //                         })}
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>

// //                 {formattedResume.sections.length === 0 && (
// //                   <p className="py-10 text-center text-sm text-slate-500">
// //                     No resume sections could be detected. Please check the generated content.
// //                   </p>
// //                 )}
// //               </div>
// //             </div>

// //             {/* ORIGINAL TEXT EDITOR */}
// //             <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
// //               <summary className="cursor-pointer text-sm font-bold text-slate-700">
// //                 Edit Generated Resume Text
// //               </summary>

// //               <textarea
// //                 value={improvedResume}
// //                 onChange={(event) => setImprovedResume(event.target.value)}
// //                 rows={18}
// //                 className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-indigo-500"
// //                 aria-label="Edit generated resume text"
// //               />

// //               <p className="mt-2 text-xs text-slate-500">
// //                 Changes made here will automatically update the formatted preview.
// //               </p>
// //             </details>

// //             <p className="text-xs leading-relaxed text-slate-500">
// //               Review your personal information and experience before downloading.
// //               Missing skills should only be added if you genuinely know them.
// //             </p>
// //           </section>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ResumeATSSimulator;






// import React, { useState, useContext, useEffect, useMemo } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { AppContext } from "../context/AppContext";
// import { analyzeResumeATS as localAnalyzeATS } from "../utils/clientSkillMatcher";
// import ResumeDetailsForm from "./ResumeDetailsForm";
// // ==========================================
// // RESUME PARSER
// // ==========================================
// const parseResume = (text = "") => {
//   const lines = text
//     .replace(/\r/g, "")
//     .split("\n")
//     .map((line) => line.trim())
//     .filter(Boolean);

//   const headingPatterns = [
//     { name: "Professional Summary", regex: /^(professional summary|summary|career objective|profile|about me)$/i },
//     { name: "Technical Skills", regex: /^(technical skills|skills|key skills|core competencies|technical expertise)$/i },
//     { name: "Work Experience", regex: /^(work experience|professional experience|experience|employment history|internship experience)$/i },
//     { name: "Projects", regex: /^(projects|personal projects|academic projects|key projects)$/i },
//     { name: "Education", regex: /^(education|academic background|educational qualifications)$/i },
//     { name: "Certifications", regex: /^(certifications|certificates|courses|licenses)$/i },
//     { name: "Achievements", regex: /^(achievements|awards|accomplishments)$/i },
//     { name: "Additional Information", regex: /^(additional information|languages|interests|activities)$/i },
//   ];

//   const sections = [];
//   let currentSection = null;
//   let name = "";
//   const contact = [];

//   const isHeading = (line) => {
//     const clean = line.replace(/[:#*]/g, "").trim();
//     return headingPatterns.find((item) => item.regex.test(clean));
//   };

//   const isContact = (line) =>
//     /@|(\+?\d[\d\s()-]{7,}\d)|linkedin\.com|github\.com|portfolio|https?:\/\/|^location\s*:/i.test(line);

//   const nameIndex = lines.findIndex(
//     (line) => !isHeading(line) && !isContact(line)
//   );

//   if (nameIndex !== -1) {
//     name = lines[nameIndex]
//       .replace(/^[#*\s]+|[*\s]+$/g, "")
//       .replace(/^(name\s*:\s*)/i, "")
//       .trim();

//     if (/^(professional summary|technical skills|work experience|projects|education)$/i.test(name)) {
//       name = "";
//     }
//   }

//   lines.forEach((line, index) => {
//     if (index === nameIndex) return;

//     if (isContact(line)) {
//       contact.push(line.replace(/^[|•·,\s]+|[|•·,\s]+$/g, ""));
//       return;
//     }

//     const heading = isHeading(line);

//     if (heading) {
//       currentSection = {
//         title: heading.name,
//         content: [],
//       };
//       sections.push(currentSection);
//       return;
//     }

//     if (!currentSection) {
//       currentSection = {
//         title: "Professional Summary",
//         content: [],
//       };
//       sections.push(currentSection);
//     }

//     const cleaned = line
//       .replace(/^#{1,6}\s*/, "")
//       .replace(/^\*\*(.*?)\*\*$/, "$1")
//       .trim();

//     if (cleaned) {
//       currentSection.content.push(cleaned);
//     }
//   });

//   return {
//     name,
//     contact: [...new Set(contact)],
//     sections: sections.filter((section) => section.content.length > 0),
//   };
// };

// // ==========================================
// // MERGE ORIGINAL DETAILS WITH AI RESUME
// // ==========================================
// const mergeResumeDetails = (originalText, generatedText) => {
//   const original = parseResume(originalText);
//   const generated = parseResume(generatedText);

//   // Original contact details get priority
//   const contactMap = new Map();

//   [...original.contact, ...generated.contact].forEach((item) => {
//     const key = item.toLowerCase().replace(/\s+/g, "");
//     if (!contactMap.has(key)) {
//       contactMap.set(key, item);
//     }
//   });

//   const contact = Array.from(contactMap.values());

//   // Prefer the original candidate name
//   const name = original.name || generated.name;

//   // Merge original and generated sections
//   const sectionsMap = new Map();

//   [...original.sections, ...generated.sections].forEach((section) => {
//     const key = section.title.toLowerCase();

//     if (!sectionsMap.has(key)) {
//       sectionsMap.set(key, {
//         title: section.title,
//         content: [],
//       });
//     }

//     const existing = sectionsMap.get(key);

//     section.content.forEach((item) => {
//       const normalizedItem = item
//         .toLowerCase()
//         .replace(/\s+/g, " ")
//         .trim();

//       const alreadyExists = existing.content.some(
//         (oldItem) =>
//           oldItem.toLowerCase().replace(/\s+/g, " ").trim() === normalizedItem
//       );

//       if (!alreadyExists) {
//         existing.content.push(item);
//       }
//     });
//   });

//   return {
//     name,
//     contact,
//     sections: Array.from(sectionsMap.values()),
//   };
// };

// // ==========================================
// // HTML ESCAPE
// // ==========================================
// const escapeHtml = (value = "") =>
//   String(value).replace(/[&<>"']/g, (char) => {
//     const entities = {
//       "&": "&amp;",
//       "<": "&lt;",
//       ">": "&gt;",
//       '"': "&quot;",
//       "'": "&#39;",
//     };
//     return entities[char];
//   });

// // ==========================================
// // RESUME HTML FOR PDF
// // ==========================================
// const createResumeHtml = (resume) => {
//   const contactHtml = resume.contact
//     .map((item) => `<span>${escapeHtml(item)}</span>`)
//     .join('<span class="separator">|</span>');

//   const sectionsHtml = resume.sections
//     .map((section) => {
//       const content = section.content
//         .map((item) => {
//           const isBullet = /^[-•*▪]\s*/.test(item);

//           if (isBullet) {
//             return `<li>${escapeHtml(item.replace(/^[-•*▪]\s*/, ""))}</li>`;
//           }

//           return `<p>${escapeHtml(item)}</p>`;
//         })
//         .join("");

//       const hasBullets = section.content.some((item) =>
//         /^[-•*▪]\s*/.test(item)
//       );

//       return `
//         <section class="resume-section">
//           <h2>${escapeHtml(section.title)}</h2>
//           ${hasBullets ? `<ul>${content}</ul>` : content}
//         </section>
//       `;
//     })
//     .join("");

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8" />
//       <title>Professional Resume</title>
//       <style>
//         @page {
//           size: A4;
//           margin: 14mm 17mm;
//         }

//         * {
//           box-sizing: border-box;
//         }

//         body {
//           margin: 0;
//           padding: 0;
//           font-family: Arial, Helvetica, sans-serif;
//           color: #263445;
//           font-size: 10pt;
//           line-height: 1.5;
//         }

//         .resume-header {
//           text-align: center;
//           padding-bottom: 16px;
//           border-bottom: 2px solid #1e40af;
//           margin-bottom: 20px;
//         }

//         h1 {
//           color: #172554;
//           font-size: 25pt;
//           margin: 0 0 9px;
//           font-weight: 800;
//           text-transform: uppercase;
//           letter-spacing: 1px;
//         }

//         .contact {
//           display: flex;
//           justify-content: center;
//           flex-wrap: wrap;
//           gap: 5px 9px;
//           color: #475569;
//           font-size: 9pt;
//         }

//         .separator {
//           color: #94a3b8;
//         }

//         .resume-section {
//           margin-bottom: 17px;
//           break-inside: auto;
//         }

//         h2 {
//           color: #1e40af;
//           font-size: 11pt;
//           text-transform: uppercase;
//           letter-spacing: 0.8px;
//           border-bottom: 1px solid #cbd5e1;
//           padding-bottom: 5px;
//           margin: 0 0 9px;
//           break-after: avoid;
//         }

//         p {
//           margin: 4px 0;
//           text-align: justify;
//         }

//         ul {
//           padding-left: 19px;
//           margin: 5px 0;
//         }

//         li {
//           padding-left: 3px;
//           margin-bottom: 5px;
//           text-align: justify;
//         }

//         @media print {
//           body {
//             print-color-adjust: exact;
//             -webkit-print-color-adjust: exact;
//           }
//         }
//       </style>
//     </head>

//     <body>
//       <header class="resume-header">
//         <h1>${escapeHtml(resume.name || "NAME NOT PROVIDED")}</h1>
//         <div class="contact">${contactHtml}</div>
//       </header>

//       ${sectionsHtml}
//     </body>
//     </html>
//   `;
// };

// // ==========================================
// // MAIN COMPONENT
// // ==========================================
// const ResumeATSSimulator = () => {
//   const { jobs = [], backendUrl } = useContext(AppContext);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [selectedJobId, setSelectedJobId] = useState("");
//   const [customJobTitle, setCustomJobTitle] = useState("");
//   const [customJobDescription, setCustomJobDescription] = useState("");
//   const [useCustomJob, setUseCustomJob] = useState(false);

//   const [resumeText, setResumeText] = useState("");
//   const [resumeFileName, setResumeFileName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [optimizing, setOptimizing] = useState(false);
//   const [generatingResume, setGeneratingResume] = useState(false);

//   const [atsResult, setAtsResult] = useState(null);
//   const [optimizationResult, setOptimizationResult] = useState(null);
//   const [improvedResume, setImprovedResume] = useState("");

//   const targetJob = jobs.find((job) => job._id === selectedJobId);

//   // IMPORTANT:
//   // Merge original resume with AI-generated resume.
//   // Original name, phone, email, education, skills, projects etc. stay preserved.
//   const formattedResume = useMemo(
//     () => mergeResumeDetails(resumeText, improvedResume),
//     [resumeText, improvedResume]
//   );

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const passedJobId = params.get("jobId") || location.state?.jobId;

//     if (passedJobId) {
//       setSelectedJobId(passedJobId);
//     } else if (jobs.length && !selectedJobId) {
//       setSelectedJobId(jobs[0]._id);
//     }
//   }, [jobs, location, selectedJobId]);

//   const getJobDetails = () => ({
//     jobTitle: useCustomJob
//       ? customJobTitle.trim()
//       : targetJob?.title || "",
//     jobDescription: useCustomJob
//       ? customJobDescription.trim()
//       : targetJob?.description || "",
//   });

//   const resetResults = () => {
//     setAtsResult(null);
//     setOptimizationResult(null);
//     setImprovedResume("");
//   };

//   // ==========================================
//   // FILE UPLOAD
//   // ==========================================
//   const handleFileUpload = (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error("File size must be under 10 MB.");
//       event.target.value = "";
//       return;
//     }

//     const extension = file.name.split(".").pop()?.toLowerCase();

//     if (extension !== "txt") {
//       toast.info(
//         "Direct PDF/DOCX reading is not configured. Copy your resume text and paste it into the text box."
//       );
//       event.target.value = "";
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const text = String(e.target?.result || "")
//         .replace(/\r/g, "")
//         .slice(0, 30000)
//         .trim();

//       setResumeText(text);
//       setResumeFileName(file.name);
//       resetResults();

//       if (text.length < 10) {
//         toast.warning("Please check the text extracted from your file.");
//       } else {
//         toast.success("Resume text loaded!");
//       }
//     };

//     reader.onerror = () => toast.error("Could not read this file.");
//     reader.readAsText(file);
//   };

//   // ==========================================
//   // SAMPLE RESUME
//   // ==========================================
//   const loadSampleResume = () => {
//     const sample = `Rahul Sharma
// Email: rahul.sharma@example.com
// Phone: +91 9876543210
// LinkedIn: linkedin.com/in/rahul-sharma
// GitHub: github.com/rahul-sharma

// PROFESSIONAL SUMMARY
// Motivated software developer with experience in frontend development and full-stack application development.

// EDUCATION
// B.Tech in Computer Science and Engineering - XYZ University (2020-2024)

// TECHNICAL SKILLS
// Frontend Development:
// - React
// - JavaScript
// - HTML5
// - CSS3
// Backend Development:
// - Node.js
// - Express.js
// - MongoDB
// - REST APIs
// Tools:
// - Git
// - GitHub
// - VS Code
// - Postman

// PROJECTS
// E-Commerce Web Application
// - Built a full-stack e-commerce application using React, Express, Node.js and MongoDB.
// - Implemented user authentication and shopping cart management.
// - Created responsive UI components using Tailwind CSS.

// Job Portal and Candidate Matching System
// - Developed a job portal for job seekers and recruiters using the MERN stack.
// - Implemented resume text parsing and skill keyword matching.

// WORK EXPERIENCE
// Frontend Developer Intern | TechSolutions Pvt Ltd (Jan 2024 - Jun 2024)
// - Developed interactive React components for a client dashboard.
// - Integrated REST APIs with backend services.`;

//     setResumeText(sample);
//     setResumeFileName("Sample_Resume.txt");
//     resetResults();
//     toast.info("Sample resume loaded.");
//   };

//   // ==========================================
//   // ATS ANALYSIS
//   // ==========================================
//   const handleAnalyzeATS = async () => {
//     if (!resumeText.trim()) {
//       toast.error("Please upload or paste your resume first.");
//       return;
//     }

//     const { jobTitle, jobDescription } = getJobDetails();

//     if (!jobTitle || !jobDescription) {
//       toast.error("Please select a job or enter a custom job title and description.");
//       return;
//     }

//     try {
//       setLoading(true);
//       resetResults();

//       const payload = {
//         jobId: useCustomJob ? undefined : selectedJobId,
//         jobTitle,
//         jobDescription,
//         resumeText: resumeText.trim().slice(0, 30000),
//       };

//       let data;

//       try {
//         const response = await axios.post(
//           `${backendUrl}/api/jobs/ats-analyze`,
//           payload
//         );
//         data = response.data;
//       } catch (error) {
//         try {
//           const response = await axios.post(
//             `${backendUrl}/api/jobs/match`,
//             payload
//           );
//           data = response.data;
//         } catch {
//           data = localAnalyzeATS(
//             payload.resumeText,
//             jobDescription,
//             jobTitle
//           );
//         }
//       }

//       const result = data?.data || data;

//       if (
//         data?.success === false ||
//         !result ||
//         (result.atsScore === undefined && result.score === undefined)
//       ) {
//         throw new Error(data?.message || "ATS analysis failed.");
//       }

//       const detectedSkills =
//         result.detectedSkills || result.matchedSkills || [];

//       const missingKeywords =
//         result.missingKeywords || result.missingSkills || [];

//       const wordCount =
//         result.wordCount ??
//         payload.resumeText.split(/\s+/).filter(Boolean).length;

//       setAtsResult({
//         ...result,
//         atsScore: Math.max(
//           0,
//           Math.min(100, Number(result.atsScore ?? result.score ?? 0))
//         ),
//         detectedSkills,
//         missingKeywords,
//         sections: {
//           hasEducation: Boolean(
//             result.sections?.hasEducation ??
//               /\beducation\b/i.test(payload.resumeText)
//           ),
//           hasProjects: Boolean(
//             result.sections?.hasProjects ??
//               /\bprojects?\b/i.test(payload.resumeText)
//           ),
//           hasContact: Boolean(
//             result.sections?.hasContact ??
//               /@|phone|linkedin|github/i.test(payload.resumeText)
//           ),
//         },
//         wordCount,
//         isTooLong:
//           result.isTooLong ?? wordCount > 600,
//       });

//       toast.success("ATS scan completed!");
//     } catch (error) {
//       console.error("ATS scan error:", error);
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to analyze resume."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // AI OPTIMIZATION
//   // ==========================================
//   const handleOptimizeForJob = async () => {
//     if (!atsResult) {
//       toast.error("Run the ATS scan first.");
//       return;
//     }

//     const { jobTitle, jobDescription } = getJobDetails();

//     try {
//       setOptimizing(true);

//       const { data } = await axios.post(
//         `${backendUrl}/api/jobs/ats-optimize`,
//         {
//           jobTitle,
//           jobDescription,
//           resumeText: resumeText.trim().slice(0, 30000),
//           candidateSkills: atsResult.detectedSkills || [],
//           missingSkills: atsResult.missingKeywords || [],
//         }
//       );

//       if (!data?.success || !data.data) {
//         throw new Error(data?.message || "Could not generate suggestions.");
//       }

//       setOptimizationResult(data.data);
//       toast.success("Optimization suggestions generated!");
//     } catch (error) {
//       console.error("Resume optimization error:", error);
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to generate suggestions."
//       );
//     } finally {
//       setOptimizing(false);
//     }
//   };

//   // ==========================================
//   // GENERATE IMPROVED RESUME
//   // ==========================================
//   const handleGenerateResume = async () => {
//     if (!atsResult || !resumeText.trim()) {
//       toast.error("Run the ATS scan before generating your new resume.");
//       return;
//     }

//     const { jobTitle, jobDescription } = getJobDetails();

//     if (!jobTitle || !jobDescription) {
//       toast.error("Please select a job with a description.");
//       return;
//     }

//     try {
//       setGeneratingResume(true);
//       setImprovedResume("");

//       const { data } = await axios.post(
//         `${backendUrl}/api/jobs/ats-generate-resume`,
//         {
//           jobTitle,
//           jobDescription,
//           resumeText: resumeText.trim().slice(0, 30000),
//           candidateSkills: atsResult.detectedSkills || [],
//           missingSkills: atsResult.missingKeywords || [],
//         }
//       );

//       const generated =
//         data?.data?.resumeText ||
//         data?.resumeText ||
//         data?.data?.resume ||
//         "";

//       if (!data?.success || !generated.trim()) {
//         throw new Error(data?.message || "Resume generation failed.");
//       }

//       setImprovedResume(generated.trim());
//       toast.success("Your professional resume is ready!");
//     } catch (error) {
//       console.error("Generate resume error:", error);
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Could not generate the resume. Check the backend and try again."
//       );
//     } finally {
//       setGeneratingResume(false);
//     }
//   };

//   // ==========================================
//   // YOUTUBE SKILL TUTORIAL
//   // ==========================================
//   const openSkillTutorial = (skill) => {
//     const query = encodeURIComponent(`${skill} tutorial for beginners`);
//     window.open(
//       `https://www.youtube.com/results?search_query=${query}`,
//       "_blank",
//       "noopener,noreferrer"
//     );
//   };

//   // ==========================================
//   // DOWNLOAD PROFESSIONAL PDF
//   // ==========================================
//   const downloadResumeAsPdf = () => {
//     if (!improvedResume.trim()) {
//       toast.error("Generate your improved resume first.");
//       return;
//     }

//     const printWindow = window.open("", "_blank");

//     if (!printWindow) {
//       toast.error("Please allow pop-ups to download your resume.");
//       return;
//     }

//     printWindow.document.open();
//     printWindow.document.write(createResumeHtml(formattedResume));
//     printWindow.document.close();

//     printWindow.onload = () => {
//       printWindow.focus();
//       printWindow.print();
//     };
//   };

//   const scoreColor =
//     (atsResult?.atsScore ?? 0) >= 80
//       ? "text-emerald-400"
//       : (atsResult?.atsScore ?? 0) >= 60
//       ? "text-amber-400"
//       : "text-rose-400";

//   return (
//     <div className="min-h-screen bg-slate-50 px-4 py-10 font-sans sm:px-6">
//       <div className="mx-auto max-w-6xl space-y-8">

//         {/* HEADER */}
//         <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
//           <div>
//             <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
//               Resume ATS Simulator
//             </h1>
//             <p className="mt-2 text-sm text-slate-600">
//               Check your ATS score, learn missing skills, and generate a professional resume.
//             </p>
//           </div>

//           <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
//             <button
//               type="button"
//               onClick={() => navigate("/ai-match")}
//               className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
//             >
//               Skill Matcher
//             </button>
//             <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
//               ATS Simulator
//             </span>
//           </div>
//         </header>

//         <div className="grid items-start gap-8 lg:grid-cols-2">

//           {/* LEFT: INPUT */}
//           <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <h2 className="text-lg font-bold text-slate-900">
//                 1. Upload or Paste Resume
//               </h2>

//               <button
//                 type="button"
//                 onClick={loadSampleResume}
//                 className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
//               >
//                 Load Sample Resume
//               </button>
//             </div>

//             <div>
//               <label className="mb-2 block text-xs font-semibold text-slate-600">
//                 Upload a TXT resume
//               </label>

//               <input
//                 type="file"
//                 accept=".txt"
//                 onChange={handleFileUpload}
//                 className="w-full rounded-xl border border-dashed border-slate-300 p-4 text-sm"
//               />

//               {resumeFileName && (
//                 <p className="mt-2 text-xs text-slate-500">
//                   {resumeFileName}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="mb-2 block text-xs font-semibold text-slate-600">
//                 Resume Content
//               </label>

//               <textarea
//                 rows={12}
//                 maxLength={30000}
//                 value={resumeText}
//                 onChange={(event) => {
//                   setResumeText(event.target.value);
//                   resetResults();
//                 }}
//                 placeholder="Paste your resume text here..."
//                 className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//               />

//               <p className="mt-1 text-right text-xs text-slate-400">
//                 {resumeText.length}/30000 characters
//               </p>
//             </div>

//             {/* JOB SELECTION */}
//             <div className="space-y-4 border-t border-slate-100 pt-4">
//               <div className="flex flex-wrap items-center justify-between gap-3">
//                 <h3 className="text-sm font-bold text-slate-900">
//                   2. Select Target Job
//                 </h3>

//                 <div className="flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setUseCustomJob(false)}
//                     className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
//                       !useCustomJob
//                         ? "bg-indigo-600 text-white"
//                         : "bg-slate-100 text-slate-600"
//                     }`}
//                   >
//                     Portal Jobs
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setUseCustomJob(true)}
//                     className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
//                       useCustomJob
//                         ? "bg-indigo-600 text-white"
//                         : "bg-slate-100 text-slate-600"
//                     }`}
//                   >
//                     Custom Job
//                   </button>
//                 </div>
//               </div>

//               {!useCustomJob ? (
//                 <select
//                   value={selectedJobId}
//                   onChange={(event) => {
//                     setSelectedJobId(event.target.value);
//                     resetResults();
//                   }}
//                   className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
//                 >
//                   <option value="">-- Select a job --</option>

//                   {jobs.map((job) => (
//                     <option key={job._id} value={job._id}>
//                       {job.title} — {job.companyId?.name || "Company"}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <div className="space-y-3">
//                   <input
//                     value={customJobTitle}
//                     onChange={(event) => setCustomJobTitle(event.target.value)}
//                     placeholder="Job title"
//                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
//                   />

//                   <textarea
//                     rows={4}
//                     value={customJobDescription}
//                     onChange={(event) =>
//                       setCustomJobDescription(event.target.value)
//                     }
//                     placeholder="Paste the complete job description and required skills..."
//                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>
//               )}
//             </div>

//             <button
//               type="button"
//               onClick={handleAnalyzeATS}
//               disabled={loading}
//               className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-60"
//             >
//               {loading ? "Scanning Resume..." : "Run ATS Resume Scan"}
//             </button>
//           </section>

//           {/* RIGHT: ATS RESULTS */}
//           <section className="space-y-6">
//             {!atsResult ? (
//               <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
//                 <div className="text-5xl">📊</div>
//                 <h3 className="mt-4 text-lg font-bold text-slate-800">
//                   ATS Results Dashboard
//                 </h3>
//                 <p className="mt-2 text-sm text-slate-500">
//                   Run an ATS scan to see your score, detected skills, and missing keywords.
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

//                 {/* SCORE */}
//                 <div className="rounded-xl bg-slate-900 p-6 text-white">
//                   <div className="flex items-center justify-between gap-4">
//                     <div>
//                       <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
//                         ATS Compatibility Score
//                       </p>
//                       <p className="mt-1 text-xs text-slate-300">
//                         Based on the analysis result
//                       </p>
//                     </div>

//                     <span className={`text-4xl font-extrabold ${scoreColor}`}>
//                       {atsResult.atsScore}/100
//                     </span>
//                   </div>

//                   <div className="mt-5 h-2 rounded-full bg-slate-700">
//                     <div
//                       className="h-2 rounded-full bg-indigo-400"
//                       style={{ width: `${atsResult.atsScore}%` }}
//                     />
//                   </div>
//                 </div>

//                 {/* DETECTED SKILLS */}
//                 <div>
//                   <h3 className="mb-3 text-sm font-bold text-emerald-700">
//                     ✓ Skills Detected
//                   </h3>

//                   <div className="flex flex-wrap gap-2">
//                     {atsResult.detectedSkills.length ? (
//                       atsResult.detectedSkills.map((skill, index) => (
//                         <span
//                           key={`${skill}-${index}`}
//                           className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800"
//                         >
//                           {skill}
//                         </span>
//                       ))
//                     ) : (
//                       <p className="text-xs text-slate-500">
//                         No matching skills detected.
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* SECTIONS */}
//                 <div className="space-y-2">
//                   {[
//                     ["Education detected", atsResult.sections.hasEducation],
//                     ["Projects detected", atsResult.sections.hasProjects],
//                     ["Contact details detected", atsResult.sections.hasContact],
//                   ].map(([label, present]) => (
//                     <p
//                       key={label}
//                       className={`text-sm font-semibold ${
//                         present ? "text-emerald-700" : "text-amber-700"
//                       }`}
//                     >
//                       {present ? "✓" : "⚠"} {label}
//                     </p>
//                   ))}
//                 </div>

//                 {/* MISSING SKILLS */}
//                 <div className="border-t border-slate-100 pt-4">
//                   <h3 className="text-sm font-bold text-amber-700">
//                     Missing Skills & YouTube Tutorials
//                   </h3>

//                   <p className="mb-3 mt-1 text-xs text-slate-500">
//                     Click a skill to find beginner tutorials.
//                   </p>

//                   <div className="space-y-2">
//                     {atsResult.missingKeywords.length ? (
//                       atsResult.missingKeywords.map((skill, index) => (
//                         <button
//                           type="button"
//                           key={`${skill}-${index}`}
//                           onClick={() => openSkillTutorial(skill)}
//                           className="flex w-full items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50 p-3 text-left hover:bg-rose-100"
//                         >
//                           <span className="text-xs font-semibold text-rose-700">
//                             {skill}
//                           </span>

//                           <span className="whitespace-nowrap text-xs font-bold text-indigo-700">
//                             ▶ Watch Tutorial
//                           </span>
//                         </button>
//                       ))
//                     ) : (
//                       <p className="text-xs font-medium text-emerald-700">
//                         No missing keywords detected.
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="text-sm text-slate-600">
//                   Resume length: {atsResult.wordCount} words

//                   {atsResult.isTooLong && (
//                     <span className="ml-2 text-amber-700">
//                       (Consider shortening it)
//                     </span>
//                   )}
//                 </div>

//                 {/* AI BUTTONS */}
//                 <div className="space-y-3 border-t border-slate-200 pt-4">
//                   <button
//                     type="button"
//                     onClick={handleOptimizeForJob}
//                     disabled={optimizing}
//                     className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
//                   >
//                     {optimizing
//                       ? "Generating Suggestions..."
//                       : "Get AI Optimization Suggestions"}
//                   </button>

//                   <button
//                     type="button"
//                     onClick={handleGenerateResume}
//                     disabled={generatingResume}
//                     className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
//                   >
//                     {generatingResume
//                       ? "Generating Your New Resume..."
//                       : "✨ Generate My New Resume"}
//                   </button>

//                   <p className="text-xs leading-relaxed text-slate-500">
//                     AI will improve your wording and highlight relevant existing experience.
//                     It must not invent missing skills or qualifications.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </section>
//         </div>

//         {/* OPTIMIZATION SUGGESTIONS */}
//         {optimizationResult && (
//           <section className="space-y-5 rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm sm:p-8">
//             <h2 className="text-xl font-extrabold text-slate-900">
//               AI Resume Optimization Suggestions
//             </h2>

//             <div className="grid gap-5 md:grid-cols-2">
//               <div className="rounded-xl bg-slate-50 p-5">
//                 <h3 className="mb-3 text-sm font-bold text-slate-700">
//                   Job Requires
//                 </h3>

//                 <div className="flex flex-wrap gap-2">
//                   {(optimizationResult.jobRequires || []).map((skill, i) => (
//                     <span
//                       key={`${skill}-${i}`}
//                       className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="rounded-xl bg-slate-50 p-5">
//                 <h3 className="mb-3 text-sm font-bold text-slate-700">
//                   Your Resume Contains
//                 </h3>

//                 <div className="flex flex-wrap gap-2">
//                   {(optimizationResult.yourResumeContains || []).map(
//                     (skill, i) => (
//                       <span
//                         key={`${skill}-${i}`}
//                         className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white"
//                       >
//                         {skill}
//                       </span>
//                     )
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4">
//               <h3 className="text-sm font-bold text-amber-900">
//                 Suggested Improvement
//               </h3>

//               <p className="mt-1 text-sm text-amber-800">
//                 {optimizationResult.suggestedImprovement}
//               </p>
//             </div>

//             {(optimizationResult.bulletPointImprovements || []).map(
//               (tip, index) => (
//                 <p
//                   key={index}
//                   className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950"
//                 >
//                   <strong>Tip {index + 1}:</strong> {tip}
//                 </p>
//               )
//             )}
//           </section>
//         )}

//         {/* PROFESSIONAL RESUME PREVIEW */}
//         {improvedResume && (
//           <section className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg sm:p-8">

//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//               <div>
//                 <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
//                   ✓ Resume Generated
//                 </span>

//                 <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
//                   Your Professional Resume
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Your original details and AI improvements are combined in this resume.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={downloadResumeAsPdf}
//                 className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800"
//               >
//                 <span className="mr-2">⬇</span>
//                 Download / Save as PDF
//               </button>
//             </div>

//             {/* RESUME PAPER */}
//             <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
//               <div className="mx-auto min-h-[1056px] w-full max-w-[794px] bg-white px-7 py-10 shadow-xl sm:px-12 sm:py-12">

//                 {/* NAME AND CONTACT */}
//                 <div className="border-b-2 border-blue-800 pb-5 text-center">
//                   <h1 className="break-words text-2xl font-extrabold uppercase tracking-wide text-slate-900 sm:text-3xl">
//                     {formattedResume.name || "Name not found"}
//                   </h1>

//                   {formattedResume.contact.length > 0 ? (
//                     <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs text-slate-600">
//                       {formattedResume.contact.map((item, index) => (
//                         <span key={`${item}-${index}`}>
//                           {item}
//                         </span>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="mt-2 text-xs text-amber-600">
//                       Contact details were not found in the original resume.
//                     </p>
//                   )}
//                 </div>

//                 {/* RESUME SECTIONS */}
//                 <div className="mt-7 space-y-6">
//                   {formattedResume.sections.map((section, index) => (
//                     <div key={`${section.title}-${index}`}>
//                       <h2 className="mb-3 border-b border-slate-300 pb-2 text-sm font-extrabold uppercase tracking-wider text-blue-800">
//                         {section.title}
//                       </h2>

//                       <div className="space-y-2 text-sm leading-6 text-slate-700">
//                         {section.content.map((item, itemIndex) => {
//                           const isBullet = /^[-•*▪]\s*/.test(item);
//                           const cleanItem = item.replace(/^[-•*▪]\s*/, "");

//                           if (isBullet) {
//                             return (
//                               <div
//                                 key={itemIndex}
//                                 className="flex items-start gap-2"
//                               >
//                                 <span className="mt-0.5 text-blue-800">•</span>
//                                 <p className="min-w-0 flex-1">
//                                   {cleanItem}
//                                 </p>
//                               </div>
//                             );
//                           }

//                           return (
//                             <p
//                               key={itemIndex}
//                               className="whitespace-pre-wrap"
//                             >
//                               {item}
//                             </p>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {formattedResume.sections.length === 0 && (
//                   <p className="py-10 text-center text-sm text-slate-500">
//                     No resume sections could be detected. Please check the generated content.
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* EDIT GENERATED RESUME */}
//             <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//               <summary className="cursor-pointer text-sm font-bold text-slate-700">
//                 Edit Generated Resume Text
//               </summary>

//               <textarea
//                 value={improvedResume}
//                 onChange={(event) => setImprovedResume(event.target.value)}
//                 rows={18}
//                 className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-indigo-500"
//                 aria-label="Edit generated resume text"
//               />

//               <p className="mt-2 text-xs text-slate-500">
//                 Changes made here will automatically update the formatted preview.
//                 Original contact and resume details remain included.
//               </p>
//             </details>

//             <p className="text-xs leading-relaxed text-slate-500">
//               Review your personal information and experience before downloading.
//               Missing skills should only be added if you genuinely know them.
//             </p>
//           </section>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResumeATSSimulator;





import React, { useState, useContext, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { analyzeResumeATS as localAnalyzeATS } from "../utils/clientSkillMatcher";

// ==========================================
// INITIAL MANUAL RESUME FORM
// ==========================================
const initialResumeDetails = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  degree: "",
  institution: "",
  graduationYear: "",
  grade: "",
  skills: "",
  projects: "",
  experience: "",
  certifications: "",
  achievements: "",
  languages: "",
};

// ==========================================
// CONVERT MANUAL DETAILS INTO RESUME TEXT
// ==========================================
const buildResumeText = (details) => {
  const sections = [];

  const addSection = (title, value) => {
    if (value && value.trim()) {
      sections.push(`${title.toUpperCase()}\n${value.trim()}`);
    }
  };

  const contact = [
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    details.location && `Location: ${details.location}`,
    details.linkedin && `LinkedIn: ${details.linkedin}`,
    details.github && `GitHub: ${details.github}`,
    details.portfolio && `Portfolio: ${details.portfolio}`,
  ].filter(Boolean);

  const education = [
    details.degree,
    details.institution,
    details.graduationYear &&
      `Graduation Year: ${details.graduationYear}`,
    details.grade && `CGPA / Percentage: ${details.grade}`,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    details.name.trim(),
    contact.join("\n"),
    ...[
      ["Professional Summary", details.summary],
      ["Education", education],
      ["Technical Skills", details.skills],
      ["Projects", details.projects],
      ["Work Experience", details.experience],
      ["Certifications", details.certifications],
      ["Achievements", details.achievements],
      ["Languages", details.languages],
    ]
      .filter(([, value]) => value && value.trim())
      .map(([title, value]) => `${title.toUpperCase()}\n${value.trim()}`),
  ]
    .filter(Boolean)
    .join("\n\n");
};

// ==========================================
// RESUME PARSER
// Used for formatted preview and PDF
// ==========================================
const parseResume = (text = "") => {
  const lines = String(text)
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const headingPatterns = [
    {
      name: "Professional Summary",
      regex: /^(professional summary|summary|career objective|profile|about me)$/i,
    },
    {
      name: "Technical Skills",
      regex: /^(technical skills|skills|key skills|core competencies|technical expertise)$/i,
    },
    {
      name: "Work Experience",
      regex: /^(work experience|professional experience|experience|employment history|internship experience)$/i,
    },
    {
      name: "Projects",
      regex: /^(projects|personal projects|academic projects|key projects)$/i,
    },
    {
      name: "Education",
      regex: /^(education|academic background|educational qualifications)$/i,
    },
    {
      name: "Certifications",
      regex: /^(certifications|certificates|courses|licenses)$/i,
    },
    {
      name: "Achievements",
      regex: /^(achievements|awards|accomplishments)$/i,
    },
    {
      name: "Languages",
      regex: /^(languages|language proficiency)$/i,
    },
    {
      name: "Additional Information",
      regex: /^(additional information|interests|activities)$/i,
    },
  ];

  const sections = [];
  let currentSection = null;
  let name = "";
  const contact = [];

  const isHeading = (line) => {
    const clean = line.replace(/[:#*]/g, "").trim();
    return headingPatterns.find((item) => item.regex.test(clean));
  };

  const isContact = (line) =>
    /@|(\+?\d[\d\s()-]{7,}\d)|linkedin\.com|github\.com|portfolio|https?:\/\/|^location\s*:/i.test(line);

  const nameIndex = lines.findIndex(
    (line) => !isHeading(line) && !isContact(line)
  );

  if (nameIndex !== -1) {
    name = lines[nameIndex]
      .replace(/^[#*\s]+|[*\s]+$/g, "")
      .replace(/^(name\s*:\s*)/i, "")
      .trim();
  }

  lines.forEach((line, index) => {
    if (index === nameIndex) return;

    if (isContact(line)) {
      contact.push(line.replace(/^[|•·,\s]+|[|•·,\s]+$/g, ""));
      return;
    }

    const heading = isHeading(line);

    if (heading) {
      currentSection = {
        title: heading.name,
        content: [],
      };

      sections.push(currentSection);
      return;
    }

    if (!currentSection) {
      currentSection = {
        title: "Professional Summary",
        content: [],
      };

      sections.push(currentSection);
    }

    const cleaned = line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^\*\*(.*?)\*\*$/, "$1")
      .trim();

    if (cleaned) {
      currentSection.content.push(cleaned);
    }
  });

  return {
    name,
    contact: [...new Set(contact)],
    sections: sections.filter((section) => section.content.length > 0),
  };
};

// ==========================================
// MERGE ORIGINAL DETAILS WITH AI RESUME
// ==========================================
const mergeResumeDetails = (originalText, generatedText) => {
  const original = parseResume(originalText);
  const generated = parseResume(generatedText);

  const contactMap = new Map();

  [...original.contact, ...generated.contact].forEach((item) => {
    const key = item.toLowerCase().replace(/\s+/g, "");

    if (!contactMap.has(key)) {
      contactMap.set(key, item);
    }
  });

  const contact = Array.from(contactMap.values());
  const name = original.name || generated.name;

  const sectionsMap = new Map();

  [...original.sections, ...generated.sections].forEach((section) => {
    const key = section.title.toLowerCase();

    if (!sectionsMap.has(key)) {
      sectionsMap.set(key, {
        title: section.title,
        content: [],
      });
    }

    const existing = sectionsMap.get(key);

    section.content.forEach((item) => {
      const normalizedItem = item
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      const alreadyExists = existing.content.some(
        (oldItem) =>
          oldItem.toLowerCase().replace(/\s+/g, " ").trim() ===
          normalizedItem
      );

      if (!alreadyExists) {
        existing.content.push(item);
      }
    });
  });

  return {
    name,
    contact,
    sections: Array.from(sectionsMap.values()),
  };
};

// ==========================================
// HTML ESCAPE
// ==========================================
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

// ==========================================
// CREATE HTML FOR RESUME PDF
// ==========================================
const createResumeHtml = (resume) => {
  const contactHtml = resume.contact
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join('<span class="separator"> | </span>');

  const sectionsHtml = resume.sections
    .map((section) => {
      const content = section.content
        .map((item) => {
          const isBullet = /^[-•*▪]\s*/.test(item);

          if (isBullet) {
            return `<li>${escapeHtml(
              item.replace(/^[-•*▪]\s*/, "")
            )}</li>`;
          }

          return `<p>${escapeHtml(item)}</p>`;
        })
        .join("");

      return `
        <section class="resume-section">
          <h2>${escapeHtml(section.title)}</h2>
          <div class="section-content">${content}</div>
        </section>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Professional Resume</title>

      <style>
        @page {
          size: A4;
          margin: 14mm 17mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
          color: #263445;
          font-size: 10pt;
          line-height: 1.5;
        }

        .resume-header {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #1e40af;
          margin-bottom: 20px;
        }

        h1 {
          color: #172554;
          font-size: 25pt;
          margin: 0 0 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .contact {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 5px 9px;
          color: #475569;
          font-size: 9pt;
        }

        .separator {
          color: #94a3b8;
        }

        .resume-section {
          margin-bottom: 17px;
        }

        h2 {
          color: #1e40af;
          font-size: 11pt;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 5px;
          margin: 0 0 9px;
        }

        p {
          margin: 4px 0;
          text-align: justify;
        }

        ul {
          padding-left: 19px;
          margin: 5px 0;
        }

        li {
          padding-left: 3px;
          margin-bottom: 5px;
          text-align: justify;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>

    <body>
      <header class="resume-header">
        <h1>${escapeHtml(resume.name || "NAME NOT PROVIDED")}</h1>
        <div class="contact">${contactHtml}</div>
      </header>

      ${sectionsHtml}
    </body>
    </html>
  `;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const ResumeATSSimulator = () => {
  const { jobs = [], backendUrl } = useContext(AppContext);

  const location = useLocation();
  const navigate = useNavigate();

  // Job selection
  const [selectedJobId, setSelectedJobId] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [useCustomJob, setUseCustomJob] = useState(false);

  // Manual resume form
  const [resumeDetails, setResumeDetails] = useState(
    initialResumeDetails
  );

  const [resumeText, setResumeText] = useState("");
  const [resumeCreated, setResumeCreated] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);

  // Results
  const [atsResult, setAtsResult] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [improvedResume, setImprovedResume] = useState("");

  const targetJob = jobs.find((job) => job._id === selectedJobId);

  const formattedResume = useMemo(
    () => mergeResumeDetails(resumeText, improvedResume),
    [resumeText, improvedResume]
  );

  // ==========================================
  // SET DEFAULT JOB
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const passedJobId = params.get("jobId") || location.state?.jobId;

    if (passedJobId) {
      setSelectedJobId(passedJobId);
    } else if (jobs.length && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, location, selectedJobId]);

  // ==========================================
  // RESET RESULTS
  // ==========================================
  const resetResults = () => {
    setAtsResult(null);
    setOptimizationResult(null);
    setImprovedResume("");
  };

  // ==========================================
  // MANUAL FORM CHANGE
  // ==========================================
  const handleDetailsChange = (event) => {
    const { name, value } = event.target;

    setResumeDetails((previous) => ({
      ...previous,
      [name]: value,
    }));

    setResumeText("");
    setResumeCreated(false);
    resetResults();
  };

  // ==========================================
  // GENERATE RESUME FROM FORM DETAILS
  // ==========================================
  const handleCreateResume = (event) => {
    event.preventDefault();

    const {
      name,
      email,
      phone,
      degree,
      institution,
      skills,
      projects,
      experience,
    } = resumeDetails;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !degree.trim() ||
      !institution.trim() ||
      !skills.trim()
    ) {
      toast.error(
        "Please fill Name, Email, Phone, Degree, College and Skills."
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^[+]?[\d\s()-]{10,18}$/.test(phone.trim())) {
      toast.error("Please enter a valid contact number.");
      return;
    }

    if (!projects.trim() && !experience.trim()) {
      toast.error(
        "Please add at least one project or work experience."
      );
      return;
    }

    const generatedText = buildResumeText(resumeDetails);

    if (!generatedText.trim()) {
      toast.error("Please complete your resume details.");
      return;
    }

    setResumeText(generatedText);
    setResumeCreated(true);
    resetResults();

    toast.success("Your resume has been created successfully!");
  };

  // ==========================================
  // LOAD SAMPLE DATA INTO MANUAL FORM
  // ==========================================
  const loadSampleResume = () => {
    const sampleDetails = {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 9876543210",
      location: "Gurugram, Haryana",
      linkedin: "linkedin.com/in/rahul-sharma",
      github: "github.com/rahul-sharma",
      portfolio: "",
      summary:
        "Motivated software developer with knowledge of frontend development and full-stack application development using the MERN stack.",
      degree: "B.Tech in Computer Science and Engineering",
      institution: "XYZ University",
      graduationYear: "2026",
      grade: "8.5 CGPA",
      skills:
        "HTML5, CSS3, JavaScript, React.js, Node.js, Express.js, MongoDB, Tailwind CSS, Git, GitHub, REST APIs",
      projects: `E-Commerce Web Application
Technologies: React, Express.js, Node.js, MongoDB
- Developed a full-stack e-commerce application.
- Implemented user authentication and shopping cart features.
- Designed responsive UI using Tailwind CSS.

Job Portal and Candidate Matching System
Technologies: MERN Stack
- Developed a job portal for job seekers and recruiters.
- Implemented resume analysis and skill matching functionality.`,
      experience: "",
      certifications: "MERN Stack Development - Online Certification",
      achievements: "Participated in technical development projects.",
      languages: "English, Hindi",
    };

    setResumeDetails(sampleDetails);
    setResumeText(buildResumeText(sampleDetails));
    setResumeCreated(true);
    resetResults();

    toast.info("Sample details loaded. You can edit them.");
  };

  // ==========================================
  // JOB DETAILS
  // ==========================================
  const getJobDetails = () => ({
    jobTitle: useCustomJob
      ? customJobTitle.trim()
      : targetJob?.title || "",

    jobDescription: useCustomJob
      ? customJobDescription.trim()
      : targetJob?.description || "",
  });

  // ==========================================
  // ATS ANALYSIS
  // ==========================================
  const handleAnalyzeATS = async () => {
    if (!resumeCreated || !resumeText.trim()) {
      toast.error("Please fill the manual form and create your resume first.");
      return;
    }

    const { jobTitle, jobDescription } = getJobDetails();

    if (!jobTitle || !jobDescription) {
      toast.error(
        "Please select a job with a complete job description."
      );
      return;
    }

    try {
      setLoading(true);
      resetResults();

      const payload = {
        jobId: useCustomJob ? undefined : selectedJobId,
        jobTitle,
        jobDescription,
        resumeText: resumeText.trim().slice(0, 30000),
      };

      let data;

      try {
        const response = await axios.post(
          `${backendUrl}/api/jobs/ats-analyze`,
          payload
        );

        data = response.data;
      } catch (error) {
        try {
          const response = await axios.post(
            `${backendUrl}/api/jobs/match`,
            payload
          );

          data = response.data;
        } catch (networkError) {
          console.warn(
            "Using client-side ATS analysis:",
            networkError.message
          );

          data = localAnalyzeATS(
            payload.resumeText,
            jobDescription,
            jobTitle
          );
        }
      }

      const result = data?.data || data;

      if (
        data?.success === false ||
        !result ||
        (result.atsScore === undefined && result.score === undefined)
      ) {
        throw new Error(data?.message || "ATS analysis failed.");
      }

      const detectedSkills =
        result.detectedSkills || result.matchedSkills || [];

      const missingKeywords =
        result.missingKeywords || result.missingSkills || [];

      const wordCount =
        result.wordCount ??
        payload.resumeText.split(/\s+/).filter(Boolean).length;

      setAtsResult({
        ...result,

        atsScore: Math.max(
          0,
          Math.min(
            100,
            Number(result.atsScore ?? result.score ?? 0)
          )
        ),

        detectedSkills,
        missingKeywords,

        sections: {
          hasEducation: Boolean(
            result.sections?.hasEducation ??
              /\beducation\b/i.test(payload.resumeText)
          ),

          hasProjects: Boolean(
            result.sections?.hasProjects ??
              /\bprojects?\b/i.test(payload.resumeText)
          ),

          hasContact: Boolean(
            result.sections?.hasContact ??
              /@|phone|linkedin|github/i.test(payload.resumeText)
          ),
        },

        wordCount,

        isTooLong: result.isTooLong ?? wordCount > 600,
      });

      toast.success("ATS scan completed!");
    } catch (error) {
      console.error("ATS scan error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to analyze resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // AI OPTIMIZATION
  // ==========================================
  const handleOptimizeForJob = async () => {
    if (!atsResult) {
      toast.error("Run the ATS scan first.");
      return;
    }

    const { jobTitle, jobDescription } = getJobDetails();

    try {
      setOptimizing(true);

      const { data } = await axios.post(
        `${backendUrl}/api/jobs/ats-optimize`,
        {
          jobTitle,
          jobDescription,

          resumeText: resumeText.trim().slice(0, 30000),

          candidateSkills: atsResult.detectedSkills || [],
          missingSkills: atsResult.missingKeywords || [],
        }
      );

      if (!data?.success || !data.data) {
        throw new Error(
          data?.message || "Could not generate suggestions."
        );
      }

      setOptimizationResult(data.data);
      toast.success("Optimization suggestions generated!");
    } catch (error) {
      console.error("Resume optimization error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate suggestions."
      );
    } finally {
      setOptimizing(false);
    }
  };

  // ==========================================
  // GENERATE IMPROVED RESUME
  // ==========================================
  const handleGenerateResume = async () => {
    if (!atsResult || !resumeText.trim()) {
      toast.error("Run the ATS scan before generating your new resume.");
      return;
    }

    const { jobTitle, jobDescription } = getJobDetails();

    if (!jobTitle || !jobDescription) {
      toast.error("Please select a job with a description.");
      return;
    }

    try {
      setGeneratingResume(true);
      setImprovedResume("");

      const { data } = await axios.post(
        `${backendUrl}/api/jobs/ats-generate-resume`,
        {
          jobTitle,
          jobDescription,

          resumeText: resumeText.trim().slice(0, 30000),

          candidateSkills: atsResult.detectedSkills || [],
          missingSkills: atsResult.missingKeywords || [],
        }
      );

      const generated =
        data?.data?.resumeText ||
        data?.resumeText ||
        data?.data?.resume ||
        "";

      if (!data?.success || !generated.trim()) {
        throw new Error(
          data?.message || "Resume generation failed."
        );
      }

      setImprovedResume(generated.trim());
      toast.success("Your professional resume is ready!");
    } catch (error) {
      console.error("Generate resume error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not generate the resume. Check the backend and try again."
      );
    } finally {
      setGeneratingResume(false);
    }
  };

  // ==========================================
  // YOUTUBE SKILL TUTORIAL
  // ==========================================
  const openSkillTutorial = (skill) => {
    const query = encodeURIComponent(
      `${skill} tutorial for beginners`
    );

    window.open(
      `https://www.youtube.com/results?search_query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // DOWNLOAD PROFESSIONAL PDF
  // ==========================================
  const downloadResumeAsPdf = () => {
    if (!improvedResume.trim()) {
      toast.error("Generate your improved resume first.");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("Please allow pop-ups to download your resume.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(createResumeHtml(formattedResume));
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  // ==========================================
  // REUSABLE INPUT STYLE
  // ==========================================
  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-slate-600";

  const scoreColor =
    (atsResult?.atsScore ?? 0) >= 80
      ? "text-emerald-400"
      : (atsResult?.atsScore ?? 0) >= 60
      ? "text-amber-400"
      : "text-rose-400";

  // ==========================================
  // UI
  // ==========================================
  
return (
  <div className="min-h-screen bg-[#f5f7fc] px-4 py-8 font-sans sm:px-6 lg:py-10">
    <div className="mx-auto max-w-7xl space-y-7">

      {/* ================= HEADER ================= */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-indigo-300/30 bg-indigo-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                HirePath AI
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                AI Powered Career Tools
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Resume ATS Simulator
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Build a professional resume, check its ATS compatibility,
              discover missing skills and create a job-ready resume.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/ai-match")}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              ⚡ Skill Matcher
            </button>

            <span className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 shadow-md">
              📄 ATS Simulator
            </span>
          </div>
        </div>

        {/* PROGRESS STEPS */}
        <div className="relative z-10 mt-9 grid grid-cols-1 gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
              {resumeCreated ? "✓" : "01"}
            </div>

            <div>
              <p className="text-sm font-bold">Build Resume</p>
              <p className="text-xs text-indigo-200">
                {resumeCreated ? "Completed" : "Enter your details"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
              {atsResult ? "✓" : "02"}
            </div>

            <div>
              <p className="text-sm font-bold">ATS Analysis</p>
              <p className="text-xs text-indigo-200">
                {atsResult ? "Scan completed" : "Check compatibility"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
              {improvedResume ? "✓" : "03"}
            </div>

            <div>
              <p className="text-sm font-bold">Final Resume</p>
              <p className="text-xs text-indigo-200">
                {improvedResume ? "Ready to download" : "Improve and download"}
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">

        {/* ================= LEFT: RESUME BUILDER ================= */}
        <section className="min-w-0 space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            {/* FORM HEADING */}
            <div className="mb-7 flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    📝
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Build Your Resume
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Fill in your details to create a resume.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={loadSampleResume}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
              >
                ✨ Load Sample Data
              </button>
            </div>

            <form onSubmit={handleCreateResume} className="space-y-7">

              {/* PERSONAL INFORMATION */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    01
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Personal Information
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Your basic contact details
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      name="name"
                      value={resumeDetails.name}
                      onChange={handleDetailsChange}
                      placeholder="Enter your full name"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={resumeDetails.email}
                      onChange={handleDetailsChange}
                      placeholder="you@example.com"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={resumeDetails.phone}
                      onChange={handleDetailsChange}
                      placeholder="+91 9876543210"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      name="location"
                      value={resumeDetails.location}
                      onChange={handleDetailsChange}
                      placeholder="City, State"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>LinkedIn Profile</label>
                    <input
                      name="linkedin"
                      value={resumeDetails.linkedin}
                      onChange={handleDetailsChange}
                      placeholder="linkedin.com/in/yourprofile"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>GitHub Profile</label>
                    <input
                      name="github"
                      value={resumeDetails.github}
                      onChange={handleDetailsChange}
                      placeholder="github.com/yourprofile"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Portfolio Website</label>
                    <input
                      name="portfolio"
                      value={resumeDetails.portfolio}
                      onChange={handleDetailsChange}
                      placeholder="https://yourportfolio.com"
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* SUMMARY */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    02
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Professional Summary
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Introduce yourself professionally
                    </p>
                  </div>
                </div>

                <textarea
                  name="summary"
                  value={resumeDetails.summary}
                  onChange={handleDetailsChange}
                  rows={4}
                  placeholder="Write a short introduction about your experience, strengths, technical background and career goals..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* EDUCATION */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    03
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Education
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Your academic qualifications
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Degree / Course *</label>
                    <input
                      name="degree"
                      value={resumeDetails.degree}
                      onChange={handleDetailsChange}
                      placeholder="B.Tech in Computer Science"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>College / University *</label>
                    <input
                      name="institution"
                      value={resumeDetails.institution}
                      onChange={handleDetailsChange}
                      placeholder="Enter your college name"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Graduation Year</label>
                    <input
                      name="graduationYear"
                      value={resumeDetails.graduationYear}
                      onChange={handleDetailsChange}
                      placeholder="2027"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>CGPA / Percentage</label>
                    <input
                      name="grade"
                      value={resumeDetails.grade}
                      onChange={handleDetailsChange}
                      placeholder="8.5 CGPA / 85%"
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* SKILLS */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    04
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Technical Skills *
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Add the technologies you genuinely know
                    </p>
                  </div>
                </div>

                <textarea
                  name="skills"
                  value={resumeDetails.skills}
                  onChange={handleDetailsChange}
                  rows={4}
                  placeholder="HTML5, CSS3, JavaScript, React.js, Node.js, MongoDB, Git, REST APIs..."
                  className={`${inputClass} resize-y`}
                  required
                />

                <p className="mt-2 text-[11px] text-slate-400">
                  Separate skills using commas.
                </p>
              </div>

              {/* PROJECTS */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    05
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Projects
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Showcase your practical work
                    </p>
                  </div>
                </div>

                <textarea
                  name="projects"
                  value={resumeDetails.projects}
                  onChange={handleDetailsChange}
                  rows={6}
                  placeholder={`Project Name: HirePath AI
Technologies: React, Node.js, MongoDB
- Developed a job portal.
- Implemented resume matching and ATS analysis.
- Created recruiter and candidate dashboards.`}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* EXPERIENCE */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    06
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Work Experience / Internship
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Include internships and professional experience
                    </p>
                  </div>
                </div>

                <textarea
                  name="experience"
                  value={resumeDetails.experience}
                  onChange={handleDetailsChange}
                  rows={5}
                  placeholder={`Frontend Developer Intern
Company: ABC Technologies
Duration: January 2026 - June 2026
- Developed responsive web pages.
- Integrated REST APIs.`}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* CERTIFICATIONS */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    07
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Certifications
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Courses and certificates
                    </p>
                  </div>
                </div>

                <textarea
                  name="certifications"
                  value={resumeDetails.certifications}
                  onChange={handleDetailsChange}
                  rows={3}
                  placeholder="MERN Stack Development - ABC Institute"
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* ACHIEVEMENTS */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                    08
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Achievements
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Awards, hackathons and accomplishments
                    </p>
                  </div>
                </div>

                <textarea
                  name="achievements"
                  value={resumeDetails.achievements}
                  onChange={handleDetailsChange}
                  rows={3}
                  placeholder="Smart India Hackathon participation, awards, coding competitions..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* LANGUAGES */}
              <div className="border-t border-slate-100 pt-6">
                <label className={labelClass}>Languages</label>

                <input
                  name="languages"
                  value={resumeDetails.languages}
                  onChange={handleDetailsChange}
                  placeholder="English, Hindi"
                  className={inputClass}
                />
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs leading-5 text-amber-800">
                  <strong>Required:</strong> Name, Email, Phone, Degree,
                  College and Technical Skills. Add at least one Project
                  or Work Experience.
                </p>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                ✨ Create My Professional Resume
              </button>
            </form>

            {/* MANUAL RESUME DOWNLOAD */}
            {resumeCreated && (
              <div className="mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">
                      Your resume is ready!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Your details have been converted into resume text.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("resume-text-preview")?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                    className="flex-1 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    View Resume Text
                  </button>

                  <button
                    type="button"
                    onClick={downloadResumeAsPdf}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    ⬇ Download Resume PDF
                  </button>
                </div>

                <details id="resume-text-preview" className="rounded-xl border border-emerald-200 bg-white p-4">
                  <summary className="cursor-pointer text-xs font-bold text-slate-700">
                    Preview / Edit Resume Text
                  </summary>

                  <textarea
                    value={resumeText}
                    onChange={(event) => {
                      setResumeText(event.target.value);
                      resetResults();
                    }}
                    rows={12}
                    className="mt-4 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs leading-relaxed outline-none focus:border-indigo-500"
                  />
                </details>
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">

          {/* JOB SELECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                🎯
              </div>

              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Target Job
                </h2>
                <p className="text-xs text-slate-500">
                  Select the job to match your resume
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setUseCustomJob(false);
                  resetResults();
                }}
                className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                  !useCustomJob
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Portal Jobs
              </button>

              <button
                type="button"
                onClick={() => {
                  setUseCustomJob(true);
                  resetResults();
                }}
                className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                  useCustomJob
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Custom Job
              </button>
            </div>

            {!useCustomJob ? (
              <div>
                <label className={labelClass}>Select Job Position</label>

                <select
                  value={selectedJobId}
                  onChange={(event) => {
                    setSelectedJobId(event.target.value);
                    resetResults();
                  }}
                  className={inputClass}
                >
                  <option value="">-- Choose a job --</option>

                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} — {job.companyId?.name || "Company"}
                    </option>
                  ))}
                </select>

                {jobs.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No portal jobs found. Try Custom Job.
                  </p>
                )}

                {targetJob && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                      Selected position
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-indigo-950">
                      {targetJob.title}
                    </h3>

                    <p className="mt-1 text-xs text-indigo-700">
                      {targetJob.companyId?.name || "Company"}
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      📍 {targetJob.location || "Location not specified"}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Job Title</label>

                  <input
                    value={customJobTitle}
                    onChange={(event) => {
                      setCustomJobTitle(event.target.value);
                      resetResults();
                    }}
                    placeholder="e.g. Frontend Developer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Job Description</label>

                  <textarea
                    rows={6}
                    value={customJobDescription}
                    onChange={(event) => {
                      setCustomJobDescription(event.target.value);
                      resetResults();
                    }}
                    placeholder="Enter responsibilities, required skills and qualifications..."
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleAnalyzeATS}
                disabled={loading || !resumeCreated}
                className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analyzing Resume..." : "🔍 Run ATS Analysis"}
              </button>

              {!resumeCreated && (
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Create your resume first to start ATS analysis.
                </p>
              )}
            </div>
          </div>

          {/* ATS DASHBOARD */}
          {!atsResult ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                📊
              </div>

              <h3 className="mt-4 text-base font-extrabold text-slate-900">
                ATS Analysis Dashboard
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500">
                Select a job and analyze your resume to see your compatibility
                score, detected skills and missing keywords.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-extrabold text-slate-300">--</p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    ATS Score
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-extrabold text-slate-300">--</p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Skills Matched
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* SCORE HEADER */}
              <div className="bg-gradient-to-br from-slate-950 to-indigo-950 p-6 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                      Your ATS Score
                    </p>

                    <p className="mt-1 text-xs text-slate-300">
                      Resume compatibility
                    </p>
                  </div>

                  <div className={`text-4xl font-extrabold ${scoreColor}`}>
                    {atsResult.atsScore}
                    <span className="text-lg text-white/70">/100</span>
                  </div>
                </div>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-700"
                    style={{ width: `${atsResult.atsScore}%` }}
                  />
                </div>

                <p className="mt-2 text-right text-[10px] text-indigo-200">
                  {atsResult.atsScore >= 80
                    ? "Excellent compatibility"
                    : atsResult.atsScore >= 60
                    ? "Good compatibility"
                    : "Needs improvement"}
                </p>
              </div>

              <div className="space-y-6 p-5">

                {/* MATCHED SKILLS */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
                      Matched Skills
                    </h3>

                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      {atsResult.detectedSkills.length} Found
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {atsResult.detectedSkills.length ? (
                      atsResult.detectedSkills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">
                        No matching skills detected.
                      </p>
                    )}
                  </div>
                </div>

                {/* MISSING SKILLS */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
                      Missing Skills
                    </h3>

                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                      {atsResult.missingKeywords.length} Missing
                    </span>
                  </div>

                  <div className="space-y-2">
                    {atsResult.missingKeywords.length ? (
                      atsResult.missingKeywords.map((skill, index) => (
                        <button
                          type="button"
                          key={`${skill}-${index}`}
                          onClick={() => openSkillTutorial(skill)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                        >
                          <span className="text-xs font-semibold text-rose-800">
                            {skill}
                          </span>

                          <span className="shrink-0 text-[10px] font-bold text-indigo-700">
                            ▶ Learn
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                        ✓ Great! No missing keywords detected.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION CHECKLIST */}
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-800">
                    Resume Checklist
                  </h3>

                  <div className="space-y-3">
                    {[
                      ["Education", atsResult.sections.hasEducation],
                      ["Projects", atsResult.sections.hasProjects],
                      ["Contact Details", atsResult.sections.hasContact],
                    ].map(([label, present]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <span className="text-xs font-medium text-slate-700">
                          {label}
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            present ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {present ? "✓ Complete" : "⚠ Missing"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WORD COUNT */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-500">
                    Resume Length
                  </span>

                  <span className="text-xs font-bold text-slate-800">
                    {atsResult.wordCount} words
                    {atsResult.isTooLong && (
                      <span className="ml-1 text-amber-600">
                        (Too long)
                      </span>
                    )}
                  </span>
                </div>

                {/* AI ACTIONS */}
                <div className="space-y-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleOptimizeForJob}
                    disabled={optimizing}
                    className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-3.5 text-xs font-bold text-indigo-800 transition hover:bg-indigo-100 disabled:opacity-60"
                  >
                    {optimizing
                      ? "Generating Suggestions..."
                      : "💡 Get AI Improvement Suggestions"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateResume}
                    disabled={generatingResume}
                    className="w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {generatingResume
                      ? "Generating Your Resume..."
                      : "✨ Generate Improved Resume"}
                  </button>

                  <p className="text-center text-[10px] leading-4 text-slate-400">
                    AI suggestions improve your genuine experience and
                    presentation. They should not add skills you do not have.
                  </p>
                </div>

              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ================= OPTIMIZATION RESULTS ================= */}
      {optimizationResult && (
        <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
              💡
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                AI Resume Optimization
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Suggestions tailored to your selected job.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                📌 Job Requires
              </h3>

              <div className="flex flex-wrap gap-2">
                {(optimizationResult.jobRequires || []).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                ✓ Your Resume Contains
              </h3>

              <div className="flex flex-wrap gap-2">
                {(optimizationResult.yourResumeContains || []).map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>

          </div>

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
              Recommended Improvement
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-amber-900">
              {optimizationResult.suggestedImprovement ||
                "Keep your resume focused on relevant skills and genuine practical experience."}
            </p>
          </div>

          {(optimizationResult.bulletPointImprovements || []).length > 0 && (
            <div className="mt-6">
              <h3 className="mb-4 text-sm font-bold text-slate-900">
                Actionable Recommendations
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                {optimizationResult.bulletPointImprovements.map(
                  (tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-extrabold text-indigo-700">
                        {index + 1}
                      </span>

                      <p className="text-xs leading-6 text-slate-700">
                        {tip}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ================= FINAL RESUME ================= */}
      {improvedResume && (
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg">

          <div className="flex flex-col justify-between gap-5 bg-gradient-to-r from-emerald-950 to-emerald-800 p-6 text-white sm:flex-row sm:items-center sm:p-8">

            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[10px] font-bold text-emerald-100">
                ✓ RESUME GENERATED
              </div>

              <h2 className="text-2xl font-extrabold">
                Your Professional Resume
              </h2>

              <p className="mt-2 text-xs leading-5 text-emerald-100">
                Your manually entered details and AI improvements are combined.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadResumeAsPdf}
              className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              ⬇ Download / Save as PDF
            </button>
          </div>

          {/* RESUME PAPER */}
          <div className="bg-slate-100 p-3 sm:p-8">
            <div className="mx-auto min-h-[1056px] w-full max-w-[794px] bg-white px-7 py-10 shadow-xl sm:px-14 sm:py-14">

              <div className="border-b-2 border-blue-900 pb-6 text-center">
                <h1 className="break-words text-2xl font-extrabold uppercase tracking-wide text-slate-900 sm:text-3xl">
                  {formattedResume.name || "Name not found"}
                </h1>

                <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-2 text-[11px] text-slate-600">
                  {formattedResume.contact.map((item, index) => (
                    <span key={`${item}-${index}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-7">
                {formattedResume.sections.map((section, index) => (
                  <div key={`${section.title}-${index}`}>
                    <h3 className="mb-3 border-b border-slate-300 pb-2 text-sm font-extrabold uppercase tracking-widest text-blue-900">
                      {section.title}
                    </h3>

                    <div className="space-y-2 text-sm leading-6 text-slate-700">
                      {section.content.map((item, itemIndex) => {
                        const isBullet = /^[-•*▪]\s*/.test(item);
                        const cleanItem = item.replace(/^[-•*▪]\s*/, "");

                        return isBullet ? (
                          <div
                            key={itemIndex}
                            className="flex items-start gap-2"
                          >
                            <span className="text-blue-800">•</span>
                            <p className="flex-1">{cleanItem}</p>
                          </div>
                        ) : (
                          <p
                            key={itemIndex}
                            className="whitespace-pre-wrap"
                          >
                            {item}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {formattedResume.sections.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  No resume sections found.
                </p>
              )}
            </div>
          </div>

          {/* EDIT GENERATED RESUME */}
          <div className="border-t border-slate-100 p-6 sm:p-8">
            <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-bold text-slate-800">
                ✏ Edit Generated Resume Text
              </summary>

              <textarea
                value={improvedResume}
                onChange={(event) => setImprovedResume(event.target.value)}
                rows={18}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs leading-relaxed outline-none focus:border-indigo-500"
                aria-label="Edit generated resume"
              />

              <p className="mt-2 text-xs text-slate-500">
                Your contact details entered in the form are preserved in the
                final preview.
              </p>
            </details>

            <button
              type="button"
              onClick={downloadResumeAsPdf}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 sm:w-auto sm:px-8"
            >
              ⬇ Download Updated Resume PDF
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="pb-2 pt-2 text-center">
        <p className="text-[11px] text-slate-400">
          HirePath AI · Smart Career & Resume Assistant
        </p>
      </footer>

    </div>
  </div>
);
};

export default ResumeATSSimulator;