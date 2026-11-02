// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { AppContext } from "../context/AppContext";

// const SKILLS_LIST = [
//   "React", "JavaScript", "TypeScript", "Next.js", "HTML", "CSS", "TailwindCSS", "Bootstrap",
//   "Node.js", "Express", "Python", "Django", "Java", "C++", "PHP", "MongoDB", "SQL",
//   "PostgreSQL", "AWS", "Docker", "Git", "Figma", "UI/UX", "SEO", "Excel", "Agile"
// ];

// const calculateApplicantMatch = (user, job) => {
//   const jobText = `${job?.title || ""} ${job?.description || ""}`.toLowerCase();
//   const userText = `${user?.name || ""} ${user?.resume || ""}`.toLowerCase();

//   // Extract skills required from job description/title
//   let required = SKILLS_LIST.filter((skill) =>
//     jobText.includes(skill.toLowerCase())
//   );

//   if (required.length === 0) {
//     const title = (job?.title || "").toLowerCase();
//     if (title.includes("frontend") || title.includes("react") || title.includes("web")) {
//       required = ["React", "JavaScript", "HTML", "CSS"];
//     } else if (title.includes("backend") || title.includes("node")) {
//       required = ["Node.js", "Express", "MongoDB", "SQL"];
//     } else if (title.includes("full") || title.includes("mern")) {
//       required = ["React", "Node.js", "Express", "MongoDB"];
//     } else {
//       required = ["React", "JavaScript", "Node.js", "Git"];
//     }
//   }

//   // Extract matched skills from applicant's uploaded resume/info
//   const matched = required.filter((skill) =>
//     userText.includes(skill.toLowerCase())
//   );

//   const missing = required.filter(
//     (skill) => !userText.includes(skill.toLowerCase())
//   );

//   // Calculate realistic match score percentage based on actual applicant resume presence
//   let pct = 0;
//   if (user?.resume) {
//     if (matched.length > 0) {
//       pct = Math.round((matched.length / required.length) * 100);
//       pct = Math.min(96, Math.max(60, pct));
//     } else {
//       pct = 65; // Resume present, baseline relevance
//     }
//   } else {
//     pct = 35; // No resume uploaded yet
//   }

//   let matchLevel = "Needs Improvement";
//   let badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
//   if (pct >= 75) {
//     matchLevel = "Strong Match";
//     badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
//   } else if (pct >= 50) {
//     matchLevel = "Good Match";
//     badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
//   }

//   return { pct, matchLevel, badgeStyle, matched, missing, required };
// };

// const getDefaultInterviewDate = () => {
//   const date = new Date();
//   let daysAdded = 0;
//   while (daysAdded < 3) {
//     date.setDate(date.getDate() + 1);
//     const day = date.getDay();
//     if (day !== 0 && day !== 6) daysAdded++;
//   }
//   return date.toISOString().split("T")[0];
// };

// const ViewApplications = () => {
//   const { backendUrl, companyToken } = useContext(AppContext);
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updatingId, setUpdatingId] = useState(null);
//   const [selectedMatchModal, setSelectedMatchModal] = useState(null);

//   // Status update modals state
//   const [acceptModal, setAcceptModal] = useState(null);
//   const [rejectModal, setRejectModal] = useState(null);
//   const [candidateEmail, setCandidateEmail] = useState("");
//   const [candidateName, setCandidateName] = useState("");
//   const [interviewDate, setInterviewDate] = useState("");
//   const [interviewTime, setInterviewTime] = useState("11:00 AM IST");
//   const [interviewType, setInterviewType] = useState("Online Video Interview (Google Meet)");
//   const [interviewLink, setInterviewLink] = useState("");
//   const [notes, setNotes] = useState("");
//   const [rejectionReason, setRejectionReason] = useState("");

//   const handleOpenAccept = (app) => {
//     const defaultDate = getDefaultInterviewDate();
//     const resolvedEmail = (app.applicantEmail || app.userId?.email || "").trim();
//     const resolvedName = (app.applicantName || app.userId?.name || "Candidate").trim();
//     setCandidateEmail(resolvedEmail.includes("@clerk.user") ? "" : resolvedEmail);
//     setCandidateName(resolvedName);
//     setInterviewDate(app.interviewDetails?.date || defaultDate);
//     setInterviewTime(app.interviewDetails?.time || "11:00 AM IST");
//     setInterviewType(app.interviewDetails?.type || "Online Video Interview (Google Meet)");
//     setInterviewLink(app.interviewDetails?.link || "");
//     setNotes(app.interviewDetails?.notes || "");
//     setAcceptModal(app);
//   };

//   const handleOpenReject = (app) => {
//     const resolvedEmail = (app.applicantEmail || app.userId?.email || "").trim();
//     const resolvedName = (app.applicantName || app.userId?.name || "Candidate").trim();
//     setCandidateEmail(resolvedEmail.includes("@clerk.user") ? "" : resolvedEmail);
//     setCandidateName(resolvedName);
//     setRejectionReason(app.feedback || "");
//     setRejectModal(app);
//   };

//   const fetchCompanyApplicants = async () => {
//     try {
//       setLoading(true);
//       const token = companyToken || localStorage.getItem("companyToken");

//       const { data } = await axios.get(`${backendUrl}/api/company/applicants`, {
//         headers: { token },
//       });

//       if (data.success) {
//         setApplications(data.applications || []);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Fetch Applicants Error:", error);
//       toast.error(error.response?.data?.message || "Failed to fetch applicants");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStatus = async (id, status, extraData = {}) => {
//     try {
//       setUpdatingId(id);
//       const token = companyToken || localStorage.getItem("companyToken");

//       const payload = {
//         status,
//         ...extraData,
//       };

//       const { data } = await axios.put(
//         `${backendUrl}/api/company/change-status/${id}`,
//         payload,
//         { headers: { token } }
//       );

//       if (data.success) {
//         if (data.emailSent) {
//           toast.success(data.message || `Application marked as ${status} & email sent!`);
//         } else {
//           toast.warning(data.message || `Application marked as ${status}, but email could not be sent.`);
//         }

//         setApplications((prev) =>
//           prev.map((app) =>
//             app._id === id
//               ? {
//                   ...app,
//                   status,
//                   applicantEmail: extraData.candidateEmail || app.applicantEmail,
//                   applicantName: extraData.candidateName || app.applicantName,
//                   interviewDetails: extraData.interviewDate
//                     ? {
//                         date: extraData.interviewDate,
//                         time: extraData.interviewTime,
//                         type: extraData.interviewType,
//                         link: extraData.interviewLink,
//                         notes: extraData.notes,
//                       }
//                     : app.interviewDetails,
//                   feedback: extraData.rejectionReason || app.feedback,
//                 }
//               : app
//           )
//         );
//         setAcceptModal(null);
//         setRejectModal(null);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Update Status Error:", error);
//       toast.error(error.response?.data?.message || "Failed to update status");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   useEffect(() => {
//     fetchCompanyApplicants();
//   }, []);

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
//             Applicant Management
//           </h2>
//           <p className="text-slate-500 text-sm mt-0.5">
//             Review candidate resume AI match scores and take hiring actions.
//           </p>
//         </div>
//         <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200">
//           Total Applications: {applications.length}
//         </span>
//       </div>

//       {loading ? (
//         <div className="text-center py-16 text-slate-400 font-medium">
//           Loading applicant records...
//         </div>
//       ) : applications.length === 0 ? (
//         <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
//           <p className="text-slate-500 text-base font-semibold">
//             No job applications received yet.
//           </p>
//           <p className="text-slate-400 text-xs mt-1">
//             Applications will appear here once candidates apply to your posted jobs.
//           </p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-xl border border-slate-200">
//           <table className="w-full border-collapse text-left text-sm">
//             <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
//               <tr>
//                 <th className="p-4">#</th>
//                 <th className="p-4">Candidate</th>
//                 <th className="p-4">Applied Job</th>
//                 <th className="p-4">AI Match Score</th>
//                 <th className="p-4">Resume</th>
//                 <th className="p-4 text-center">Status</th>
//                 <th className="p-4 text-center">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100">
//               {applications.map((application, index) => {
//                 const user = application.userId || {};
//                 const job = application.jobId || {};
//                 const status = application.status || "Pending";

//                 const match = calculateApplicantMatch(user, job);

//                 return (
//                   <tr
//                     key={application._id || index}
//                     className="hover:bg-slate-50/80 transition-colors"
//                   >
//                     <td className="px-4 py-4 text-slate-400 font-medium">
//                       {index + 1}
//                     </td>

//                     {/* Candidate */}
//                     <td className="px-4 py-4">
//                       <div className="flex items-center gap-3">
//                         <img
//                           src={
//                             user.image ||
//                             `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                               user.name || "User"
//                             )}&background=random`
//                           }
//                           alt={user.name || "User"}
//                           className="w-10 h-10 rounded-full object-cover border border-slate-200"
//                         />
//                         <div>
//                           <p className="font-bold text-slate-900">
//                             {application.applicantName || user.name || "Unknown Candidate"}
//                           </p>
//                           {(application.applicantEmail || user.email) && (
//                             <p className="text-xs text-slate-500">
//                               {application.applicantEmail || user.email}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </td>

//                     {/* Job Title */}
//                     <td className="px-4 py-4 font-semibold text-slate-800">
//                       {job.title || "N/A"}
//                       {job.location && (
//                         <span className="block text-xs font-normal text-slate-500">
//                           📍 {job.location}
//                         </span>
//                       )}
//                     </td>

//                     {/* AI Match Score */}
//                     <td className="px-4 py-4">
//                       <button
//                         onClick={() =>
//                           setSelectedMatchModal({ user, job, match })
//                         }
//                         title="Click to view full AI Match breakdown"
//                         className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition transform hover:scale-105 ${match.badgeStyle}`}
//                       >
//                         <span>⚡ {match.pct}% Match</span>
//                         <span className="text-[10px] opacity-75 font-normal">
//                           ({match.matchLevel}) ℹ️
//                         </span>
//                       </button>
//                     </td>

//                     {/* Resume */}
//                     <td className="px-4 py-4">
//                       {user.resume && user.resume.trim() !== "" && !user.resume.includes("dummy.pdf") ? (
//                         <a
//                           href={user.resume}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200"
//                           title={`Open resume: ${user.resume}`}
//                         >
//                           📄 View Resume
//                         </a>
//                       ) : (
//                         <span className="text-slate-400 text-xs italic">
//                           No Resume Uploaded
//                         </span>
//                       )}
//                     </td>


//                     {/* Status */}
//                     <td className="px-4 py-4 text-center">
//                       <span
//                         className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
//                           status === "Accepted"
//                             ? "bg-emerald-100 text-emerald-800"
//                             : status === "Rejected"
//                             ? "bg-rose-100 text-rose-800"
//                             : "bg-amber-100 text-amber-800"
//                         }`}
//                       >
//                         {status}
//                       </span>
//                     </td>

//                     {/* Actions */}
//                     <td className="px-4 py-4 text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => handleOpenAccept(application)}
//                           disabled={updatingId === application._id}
//                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
//                             status === "Accepted"
//                               ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
//                               : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
//                           }`}
//                         >
//                           <span>✔</span>
//                           <span>{status === "Accepted" ? "Accepted (Edit)" : "Accept"}</span>
//                         </button>

//                         <button
//                           onClick={() => handleOpenReject(application)}
//                           disabled={updatingId === application._id}
//                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
//                             status === "Rejected"
//                               ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700"
//                               : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
//                           }`}
//                         >
//                           <span>✖</span>
//                           <span>{status === "Rejected" ? "Rejected" : "Reject"}</span>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Accept & Schedule Interview Modal */}
//       {acceptModal && (
//         <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
//           <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8">
//             <div className="flex items-center justify-between border-b pb-4 border-slate-100">
//               <div>
//                 <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider">
//                   🎉 Acceptance & Interview Scheduling
//                 </span>
//                 <h3 className="text-xl font-bold text-slate-900 mt-0.5">
//                   Invite {acceptModal.userId?.name || "Candidate"}
//                 </h3>
//                 <p className="text-xs text-slate-500">
//                   Role: <span className="font-semibold text-slate-700">{acceptModal.jobId?.title || "Job Position"}</span>
//                 </p>
//               </div>
//               <button
//                 onClick={() => setAcceptModal(null)}
//                 className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Candidate Info Badge */}
//             <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
//               <img
//                 src={
//                   acceptModal.userId?.image ||
//                   `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                     candidateName || "User"
//                   )}&background=random`
//                 }
//                 alt="Candidate"
//                 className="w-10 h-10 rounded-full object-cover border"
//               />
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-bold text-slate-900 truncate">
//                   {candidateName || "Candidate"}
//                 </p>
//                 <p className="text-xs text-slate-500 truncate">
//                   {candidateEmail || "No email provided"}
//                 </p>
//               </div>
//               <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
//                 Shortlisted
//               </span>
//             </div>

//             {/* Candidate Email Input (Verified & Editable) */}
//             <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
//               <div className="flex items-center justify-between">
//                 <label className="block text-xs font-bold text-amber-950">
//                   📧 Candidate Email Address <span className="text-rose-500">*</span>
//                 </label>
//                 <span className="text-[10px] font-semibold text-amber-800">
//                   (Interview invite will be sent to this email)
//                 </span>
//               </div>
//               <input
//                 type="email"
//                 required
//                 value={candidateEmail}
//                 onChange={(e) => setCandidateEmail(e.target.value)}
//                 placeholder="e.g. applicant@gmail.com"
//                 className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//               {!candidateEmail ? (
//                 <p className="text-[11px] text-rose-600 font-semibold">
//                   ⚠️ Please enter candidate's valid email address so they receive the email.
//                 </p>
//               ) : (
//                 <p className="text-[11px] text-emerald-700 font-medium">
//                   ✔ Interview invitation & documents checklist will be delivered to: <strong>{candidateEmail}</strong>
//                 </p>
//               )}
//             </div>

//             {/* Schedule Inputs */}
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs font-bold text-slate-700 mb-1">
//                     📅 Interview Date <span className="text-rose-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     min={new Date().toISOString().split("T")[0]}
//                     value={interviewDate}
//                     onChange={(e) => setInterviewDate(e.target.value)}
//                     className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold text-slate-700 mb-1">
//                     ⏰ Interview Time <span className="text-rose-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={interviewTime}
//                     onChange={(e) => setInterviewTime(e.target.value)}
//                     placeholder="e.g. 11:00 AM IST"
//                     className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-700 mb-1">
//                   💻 Interview Mode / Platform
//                 </label>
//                 <select
//                   value={interviewType}
//                   onChange={(e) => setInterviewType(e.target.value)}
//                   className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 >
//                   <option value="Online Video Interview (Google Meet)">Online Video Interview (Google Meet)</option>
//                   <option value="Online Video Interview (Zoom)">Online Video Interview (Zoom)</option>
//                   <option value="In-Person Office Interview">In-Person Office Interview</option>
//                   <option value="Telephonic Interview Round">Telephonic Interview Round</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-700 mb-1">
//                   📍 Meeting Link or Venue Address
//                 </label>
//                 <input
//                   type="text"
//                   value={interviewLink}
//                   onChange={(e) => setInterviewLink(e.target.value)}
//                   placeholder="e.g. https://meet.google.com/xyz-abcd-efg or Office Floor 3"
//                   className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-700 mb-1">
//                   💬 Instructions / Special Notes for Candidate (Optional)
//                 </label>
//                 <textarea
//                   rows="2"
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   placeholder="e.g. Please be ready with your latest project demo and laptop charged."
//                   className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 />
//               </div>

//               {/* Document Checklist Preview Card */}
//               <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
//                 <p className="font-bold flex items-center gap-1.5 text-emerald-950 mb-1.5">
//                   <span>📄</span>
//                   <span>Documents Candidate will be instructed to bring:</span>
//                 </p>
//                 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-emerald-800 pl-4 list-disc">
//                   <li>2 Printed Resumes / Latest CV</li>
//                   <li>Original Govt Photo ID + Photocopy</li>
//                   <li>Academic Certificates & Mark sheets</li>
//                   <li>Experience Letters & 3 Mo. Payslips</li>
//                   <li>Portfolio / GitHub / Code Demo</li>
//                   <li>2 Passport-sized Photographs</li>
//                 </ul>
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
//               <button
//                 type="button"
//                 onClick={() => setAcceptModal(null)}
//                 className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={updatingId === acceptModal._id}
//                 onClick={() => {
//                   if (!candidateEmail || !candidateEmail.includes("@")) {
//                     toast.error("Please enter a valid candidate email address to send the invitation");
//                     return;
//                   }
//                   updateStatus(acceptModal._id, "Accepted", {
//                     candidateEmail: candidateEmail.trim(),
//                     candidateName: candidateName.trim(),
//                     interviewDate,
//                     interviewTime,
//                     interviewType,
//                     interviewLocation: interviewLink,
//                     interviewLink,
//                     notes,
//                   });
//                 }}
//                 className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-60"
//               >
//                 {updatingId === acceptModal._id ? (
//                   <span>Sending Email...</span>
//                 ) : (
//                   <>
//                     <span>✔</span>
//                     <span>Confirm & Send Acceptance Email</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reject Application Modal */}
//       {rejectModal && (
//         <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
//             <div className="flex items-center justify-between border-b pb-4 border-slate-100">
//               <div>
//                 <span className="text-xs font-extrabold uppercase text-rose-600 tracking-wider">
//                   Application Rejection
//                 </span>
//                 <h3 className="text-xl font-bold text-slate-900 mt-0.5">
//                   Update Candidate Status
//                 </h3>
//               </div>
//               <button
//                 onClick={() => setRejectModal(null)}
//                 className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
//               <img
//                 src={
//                   rejectModal.userId?.image ||
//                   `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                     candidateName || "User"
//                   )}&background=random`
//                 }
//                 alt="Candidate"
//                 className="w-10 h-10 rounded-full object-cover border"
//               />
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-bold text-slate-900 truncate">
//                   {candidateName || "Candidate"}
//                 </p>
//                 <p className="text-xs text-slate-500 truncate">
//                   {rejectModal.jobId?.title || "Job Position"}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1">
//               <label className="block text-xs font-bold text-amber-950">
//                 📧 Candidate Email Address <span className="text-rose-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={candidateEmail}
//                 onChange={(e) => setCandidateEmail(e.target.value)}
//                 placeholder="candidate@gmail.com"
//                 className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
//               />
//             </div>

//             <p className="text-xs text-slate-600 leading-relaxed">
//               A respectful, constructive email will be sent to the candidate with helpful tips for future applications, letting them know their resume remains in your active talent pool.
//             </p>

//             <div>
//               <label className="block text-xs font-bold text-slate-700 mb-1">
//                 Feedback / Note for Candidate (Optional)
//               </label>
//               <textarea
//                 rows="3"
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 placeholder="e.g. Currently prioritizing profiles with more experience in cloud deployment. We encourage you to apply again!"
//                 className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
//               />
//             </div>

//             <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
//               <button
//                 type="button"
//                 onClick={() => setRejectModal(null)}
//                 className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={updatingId === rejectModal._id}
//                 onClick={() => {
//                   if (!candidateEmail || !candidateEmail.includes("@")) {
//                     toast.error("Please enter a valid candidate email address");
//                     return;
//                   }
//                   updateStatus(rejectModal._id, "Rejected", {
//                     candidateEmail: candidateEmail.trim(),
//                     candidateName: candidateName.trim(),
//                     rejectionReason,
//                   });
//                 }}
//                 className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-60"
//               >
//                 {updatingId === rejectModal._id ? (
//                   <span>Sending Email...</span>
//                 ) : (
//                   <>
//                     <span>✖</span>
//                     <span>Confirm Rejection & Send Email</span>
//                   </>
//                 )}
//               </button>
//                 {updatingId === rejectModal._id ? (
//                   <span>Sending Email...</span>
//                 ) : (
//                   <>
//                     <span>✖</span>
//                     <span>Confirm Rejection & Send Email</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* AI Skill Breakdown Modal */}
//       {selectedMatchModal && (
//         <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
//             <div className="flex items-center justify-between border-b pb-4 border-slate-100">
//               <div>
//                 <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
//                   AI Applicant Evaluation
//                 </span>
//                 <h3 className="text-xl font-bold text-slate-900 mt-0.5">
//                   {selectedMatchModal.user.name || "Candidate"}
//                 </h3>
//                 <p className="text-xs text-slate-500">
//                   Applied for: {selectedMatchModal.job.title}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <span className="text-3xl font-black text-indigo-600">
//                   {selectedMatchModal.match.pct}%
//                 </span>
//                 <span className="block text-[10px] font-semibold uppercase text-slate-400">
//                   Match Score
//                 </span>
//               </div>
//             </div>

//             {/* Matched & Missing Skills */}
//             <div className="space-y-4">
//               <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
//                 <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">
//                   ✅ Matched Skills ({selectedMatchModal.match.matched.length})
//                 </h4>
//                 {selectedMatchModal.match.matched.length > 0 ? (
//                   <div className="flex flex-wrap gap-1.5">
//                     {selectedMatchModal.match.matched.map((s, i) => (
//                       <span
//                         key={i}
//                         className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md"
//                       >
//                         ✅ {s}
//                       </span>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-xs text-slate-400">
//                     No direct skill matches detected in resume text.
//                   </p>
//                 )}
//               </div>

//               <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
//                 <h4 className="text-xs font-bold text-rose-800 uppercase mb-2">
//                   ❌ Missing Skills ({selectedMatchModal.match.missing.length})
//                 </h4>
//                 {selectedMatchModal.match.missing.length > 0 ? (
//                   <div className="flex flex-wrap gap-1.5">
//                     {selectedMatchModal.match.missing.map((s, i) => (
//                       <span
//                         key={i}
//                         className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-md"
//                       >
//                         ❌ {s}
//                       </span>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-xs text-emerald-700 font-semibold">
//                     🎉 All required skills present in candidate profile!
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="flex justify-end pt-2">
//               <button
//                 onClick={() => setSelectedMatchModal(null)}
//                 className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
//               >
//                 Close Breakdown
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewApplications;


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

// Format a date using the browser's local timezone (avoids UTC date shifts).
const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultInterviewDate = () => {
  const date = new Date();
  let weekdaysAdded = 0;

  while (weekdaysAdded < 3) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) weekdaysAdded++;
  }

  return formatLocalDate(date);
};

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedMatchModal, setSelectedMatchModal] = useState(null);

  // Status update modals state
  const [acceptModal, setAcceptModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("11:00 AM IST");
  const [interviewType, setInterviewType] = useState("Online Video Interview (Google Meet)");
  const [interviewLink, setInterviewLink] = useState("");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleOpenAccept = (app) => {
    const defaultDate = getDefaultInterviewDate();
    const resolvedEmail = (app.applicantEmail || app.userId?.email || "").trim();
    const resolvedName = (app.applicantName || app.userId?.name || "Candidate").trim();
    setCandidateEmail(resolvedEmail.includes("@clerk.user") ? "" : resolvedEmail);
    setCandidateName(resolvedName);
    setInterviewDate(app.interviewDetails?.date || defaultDate);
    setInterviewTime(app.interviewDetails?.time || "11:00 AM IST");
    setInterviewType(app.interviewDetails?.type || "Online Video Interview (Google Meet)");
    setInterviewLink(
      app.interviewDetails?.link || app.interviewDetails?.location || ""
    );
    setNotes(app.interviewDetails?.notes || "");
    setAcceptModal(app);
  };

  const handleOpenReject = (app) => {
    const resolvedEmail = (app.applicantEmail || app.userId?.email || "").trim();
    const resolvedName = (app.applicantName || app.userId?.name || "Candidate").trim();
    setCandidateEmail(resolvedEmail.includes("@clerk.user") ? "" : resolvedEmail);
    setCandidateName(resolvedName);
    setRejectionReason(app.feedback || "");
    setRejectModal(app);
  };

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

  const updateStatus = async (id, status, extraData = {}) => {
    try {
      setUpdatingId(id);
      const token = companyToken || localStorage.getItem("companyToken");

      const payload = {
        status,
        ...extraData,
      };

      const { data } = await axios.put(
        `${backendUrl}/api/company/change-status/${id}`,
        payload,
        { headers: { token } }
      );

      if (data.success) {
        if (data.emailSent) {
          toast.success(data.message || `Application marked as ${status} & email sent!`);
        } else {
          toast.warning(data.message || `Application marked as ${status}, but email could not be sent.`);
        }

        setApplications((prev) =>
          prev.map((app) =>
            app._id === id
              ? {
                  ...app,
                  status,
                  applicantEmail: extraData.candidateEmail || app.applicantEmail,
                  applicantName: extraData.candidateName || app.applicantName,
                  interviewDetails: extraData.interviewDate
                    ? {
                        date: extraData.interviewDate,
                        time: extraData.interviewTime,
                        type: extraData.interviewType,
                        link: extraData.interviewLink || extraData.interviewLocation || "",
                        location: extraData.interviewLocation || extraData.interviewLink || "",
                        notes: extraData.notes,
                      }
                    : app.interviewDetails,
                  feedback: extraData.rejectionReason || app.feedback,
                }
              : app
          )
        );
        setAcceptModal(null);
        setRejectModal(null);
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
    // Fetch once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                            {application.applicantName || user.name || "Unknown Candidate"}
                          </p>
                          {(application.applicantEmail || user.email) && (
                            <p className="text-xs text-slate-500">
                              {application.applicantEmail || user.email}
                            </p>
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
                      {user.resume && user.resume.trim() !== "" && !user.resume.includes("dummy.pdf") ? (
                        <a
                          href={user.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200"
                          title={`Open resume: ${user.resume}`}
                        >
                          📄 View Resume
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          No Resume Uploaded
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
                          onClick={() => handleOpenAccept(application)}
                          disabled={updatingId === application._id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            status === "Accepted"
                              ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span>✔</span>
                          <span>{status === "Accepted" ? "Accepted (Edit)" : "Accept"}</span>
                        </button>

                        <button
                          onClick={() => handleOpenReject(application)}
                          disabled={updatingId === application._id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            status === "Rejected"
                              ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                              : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span>✖</span>
                          <span>{status === "Rejected" ? "Rejected" : "Reject"}</span>
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

      {/* Accept & Schedule Interview Modal */}
      {acceptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider">
                  🎉 Acceptance & Interview Scheduling
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Invite {acceptModal.userId?.name || "Candidate"}
                </h3>
                <p className="text-xs text-slate-500">
                  Role: <span className="font-semibold text-slate-700">{acceptModal.jobId?.title || "Job Position"}</span>
                </p>
              </div>
              <button
                onClick={() => setAcceptModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Candidate Info Badge */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img
                src={
                  acceptModal.userId?.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    candidateName || "User"
                  )}&background=random`
                }
                alt="Candidate"
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {candidateName || "Candidate"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {candidateEmail || "No email provided"}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Shortlisted
              </span>
            </div>

            {/* Candidate Email Input (Verified & Editable) */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-950">
                  📧 Candidate Email Address <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-semibold text-amber-800">
                  (Interview invite will be sent to this email)
                </span>
              </div>
              <input
                type="email"
                required
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="e.g. applicant@gmail.com"
                className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {!candidateEmail ? (
                <p className="text-[11px] text-rose-600 font-semibold">
                  ⚠️ Please enter candidate's valid email address so they receive the email.
                </p>
              ) : (
                <p className="text-[11px] text-emerald-700 font-medium">
                  ✔ Interview invitation & documents checklist will be delivered to: <strong>{candidateEmail}</strong>
                </p>
              )}
            </div>

            {/* Schedule Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    📅 Interview Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={formatLocalDate()}
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ⏰ Interview Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    placeholder="e.g. 11:00 AM IST"
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  💻 Interview Mode / Platform
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Online Video Interview (Google Meet)">Online Video Interview (Google Meet)</option>
                  <option value="Online Video Interview (Zoom)">Online Video Interview (Zoom)</option>
                  <option value="In-Person Office Interview">In-Person Office Interview</option>
                  <option value="Telephonic Interview Round">Telephonic Interview Round</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  📍 Meeting Link or Venue Address
                </label>
                <input
                  type="text"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  placeholder="e.g. https://meet.google.com/xyz-abcd-efg or Office Floor 3"
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  💬 Instructions / Special Notes for Candidate (Optional)
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please be ready with your latest project demo and laptop charged."
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Document Checklist Preview Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1.5 text-emerald-950 mb-1.5">
                  <span>📄</span>
                  <span>Documents Candidate will be instructed to bring:</span>
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-emerald-800 pl-4 list-disc">
                  <li>2 Printed Resumes / Latest CV</li>
                  <li>Original Govt Photo ID + Photocopy</li>
                  <li>Academic Certificates & Mark sheets</li>
                  <li>Experience Letters & 3 Mo. Payslips</li>
                  <li>Portfolio / GitHub / Code Demo</li>
                  <li>2 Passport-sized Photographs</li>
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAcceptModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updatingId === acceptModal._id}
                onClick={() => {
                  if (!candidateEmail || !candidateEmail.includes("@")) {
                    toast.error("Please enter a valid candidate email address to send the invitation");
                    return;
                  }
                  if (!interviewDate) {
                    toast.error("Please select an interview date");
                    return;
                  }
                  if (!interviewTime.trim()) {
                    toast.error("Please enter the interview time");
                    return;
                  }
                  updateStatus(acceptModal._id, "Accepted", {
                    candidateEmail: candidateEmail.trim(),
                    candidateName: candidateName.trim(),
                    interviewDate,
                    interviewTime,
                    interviewType,
                    interviewLocation: interviewLink,
                    interviewLink,
                    notes,
                  });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-60"
              >
                {updatingId === acceptModal._id ? (
                  <span>Sending Email...</span>
                ) : (
                  <>
                    <span>✔</span>
                    <span>Confirm & Send Acceptance Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <span className="text-xs font-extrabold uppercase text-rose-600 tracking-wider">
                  Application Rejection
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Update Candidate Status
                </h3>
              </div>
              <button
                onClick={() => setRejectModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
              <img
                src={
                  rejectModal.userId?.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    candidateName || "User"
                  )}&background=random`
                }
                alt="Candidate"
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {candidateName || "Candidate"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {rejectModal.jobId?.title || "Job Position"}
                </p>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1">
              <label className="block text-xs font-bold text-amber-950">
                📧 Candidate Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="candidate@gmail.com"
                className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              A respectful, constructive email will be sent to the candidate with helpful tips for future applications, letting them know their resume remains in your active talent pool.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Feedback / Note for Candidate (Optional)
              </label>
              <textarea
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Currently prioritizing profiles with more experience in cloud deployment. We encourage you to apply again!"
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updatingId === rejectModal._id}
                onClick={() => {
                  if (!candidateEmail || !candidateEmail.includes("@")) {
                    toast.error("Please enter a valid candidate email address");
                    return;
                  }
                  updateStatus(rejectModal._id, "Rejected", {
                    candidateEmail: candidateEmail.trim(),
                    candidateName: candidateName.trim(),
                    rejectionReason,
                  });
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-60"
              >
                {updatingId === rejectModal._id ? (
                  <span>Sending Email...</span>
                ) : (
                  <>
                    <span>✖</span>
                    <span>Confirm Rejection & Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
