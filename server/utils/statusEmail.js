import { createTransporter, emailSender } from "./emailTransport.js";
import { hasDeliverableEmail } from "./candidateProfile.js";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

export const sendApplicationStatusEmail = async ({ candidateEmail, candidateName, jobTitle, companyName, companyEmail, status, interviewDetails, feedback }) => {
  if (!hasDeliverableEmail(candidateEmail)) throw new Error("Candidate has no deliverable registered email.");
  const accepted = status.toLowerCase() === "accepted";
  if (!accepted && status.toLowerCase() !== "rejected") throw new Error("Unsupported notification status.");
  const label = accepted ? "Accepted" : "Rejected";
  const subject = accepted ? `Application accepted: ${jobTitle} at ${companyName}`
    : `Application update: ${jobTitle} at ${companyName}`;
  const message = accepted
    ? `Congratulations! Your application for ${jobTitle} at ${companyName} has been accepted / shortlisted. The recruitment team will contact you about the next steps.`
    : `Thank you for your interest in the ${jobTitle} position at ${companyName}. After careful consideration, your application was not selected for this position. We appreciate your time and wish you success in your job search.`;
  const contact = hasDeliverableEmail(companyEmail) ? companyEmail : "";
  const interviewText = accepted && interviewDetails?.date
    ? `\n\nInterview details supplied by the recruiter:\nDate: ${interviewDetails.date}\nTime: ${interviewDetails.time || "To be confirmed"}\nType: ${interviewDetails.type || "To be confirmed"}\nLocation / link: ${interviewDetails.link || interviewDetails.location || "To be confirmed"}\n${interviewDetails.notes || ""}` : "";
  const feedbackText = !accepted && feedback ? `\n\nRecruiter feedback: ${feedback}` : "";
  const text = `Dear ${candidateName},\n\n${message}\n\nJob: ${jobTitle}\nCompany: ${companyName}\nStatus: ${label}` + interviewText + feedbackText +
    (contact ? `\nCompany contact: ${contact}` : "") + `\n\nBest regards,\n${companyName} Recruitment Team\nHirePath AI`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#334155">
    <div style="max-width:600px;margin:auto;background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#2563eb;color:white;padding:28px"><p style="margin:0 0 12px">HirePath AI</p>
    <h1 style="margin:0;font-size:24px">${accepted ? "Congratulations on your application!" : "An update on your application"}</h1></div>
    <div style="padding:28px;line-height:1.7"><p>Dear ${escapeHtml(candidateName)},</p><p>${escapeHtml(message)}</p>
    <div style="background:#eff6ff;padding:16px;border-radius:8px"><strong>Job:</strong> ${escapeHtml(jobTitle)}<br>
    <strong>Company:</strong> ${escapeHtml(companyName)}<br><strong>Status:</strong> ${label}</div>
    ${interviewText ? `<p style="white-space:pre-line">${escapeHtml(interviewText)}</p>` : ""}
    ${feedbackText ? `<p style="white-space:pre-line">${escapeHtml(feedbackText)}</p>` : ""}
    ${contact ? `<p>For questions, contact the recruitment team at <a href="mailto:${escapeHtml(contact)}">${escapeHtml(contact)}</a>.</p>` : ""}
    <p>Best regards,<br><strong>${escapeHtml(companyName)} Recruitment Team</strong></p></div>
    <div style="padding:16px;text-align:center;background:#f1f5f9;color:#64748b;font-size:12px">HirePath AI &middot; Application notification</div></div></body></html>`;
  const transporter = await createTransporter();
  const info = await transporter.sendMail({ from: emailSender(), to: candidateEmail, replyTo: contact || undefined, subject, text, html });
  if (!info.accepted?.length) throw new Error("SMTP server did not accept the notification recipient.");
  return info;
};

// Short "your application moved to <stage>" email used by the hiring progress tracker.
export const sendStageUpdateEmail = async ({ candidateEmail, candidateName, jobTitle, companyName, companyEmail, stageLabel, note }) => {
  if (!hasDeliverableEmail(candidateEmail)) throw new Error("Candidate has no deliverable registered email.");
  const contact = hasDeliverableEmail(companyEmail) ? companyEmail : "";
  const frontend = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  const trackUrl = frontend ? `${frontend}/my-applications` : "";
  const subject = `Application update: ${stageLabel} – ${jobTitle} at ${companyName}`;
  const message = `Your application for ${jobTitle} at ${companyName} has moved to a new stage: ${stageLabel}.`;
  const text = `Dear ${candidateName},\n\n${message}` + (note ? `\n\nMessage from the recruiter: ${note}` : "") +
    (trackUrl ? `\n\nTrack your progress: ${trackUrl}` : "\n\nYou can track your progress in My Applications.") +
    (contact ? `\nCompany contact: ${contact}` : "") + `\n\nBest regards,\n${companyName} Recruitment Team\nHirePath AI`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#334155">
    <div style="max-width:600px;margin:auto;background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#2563eb;color:white;padding:28px"><p style="margin:0 0 12px">HirePath AI</p>
    <h1 style="margin:0;font-size:24px">Your application moved forward</h1></div>
    <div style="padding:28px;line-height:1.7"><p>Dear ${escapeHtml(candidateName)},</p><p>${escapeHtml(message)}</p>
    <div style="background:#eff6ff;padding:16px;border-radius:8px"><strong>Job:</strong> ${escapeHtml(jobTitle)}<br>
    <strong>Company:</strong> ${escapeHtml(companyName)}<br><strong>Current stage:</strong> ${escapeHtml(stageLabel)}</div>
    ${note ? `<p style="white-space:pre-line"><strong>Message from the recruiter:</strong> ${escapeHtml(note)}</p>` : ""}
    ${trackUrl ? `<p><a href="${escapeHtml(trackUrl)}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:10px 20px;border-radius:8px">Track your progress</a></p>` : "<p>You can track your progress in My Applications.</p>"}
    ${contact ? `<p>For questions, contact the recruitment team at <a href="mailto:${escapeHtml(contact)}">${escapeHtml(contact)}</a>.</p>` : ""}
    <p>Best regards,<br><strong>${escapeHtml(companyName)} Recruitment Team</strong></p></div></div></body></html>`;
  const transporter = await createTransporter();
  const info = await transporter.sendMail({ from: emailSender(), to: candidateEmail, replyTo: contact || undefined, subject, text, html });
  if (!info.accepted?.length) throw new Error("SMTP server did not accept the notification recipient.");
  return info;
};
