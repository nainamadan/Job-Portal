import nodemailer from "nodemailer";
import { createTransporter, emailSender } from "./emailTransport.js";
export { sendApplicationStatusEmail } from "./statusEmail.js";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]);

/**
 * Sends New Job Posted notification email to all registered users
 */
export const sendNewJobNotificationEmail = async ({
  userEmail,
  userName,
  jobTitle,
  companyName,
  location,
  salary,
  level,
  category,
  applicationDeadline,
  jobDescription,
  matchReasons = [],
}) => {
  if (!userEmail) {
    console.warn("No user email provided for new job notification");
    return;
  }

  try {
    const transporter = await createTransporter();

    const subject = `🚀 New Job Alert: ${jobTitle} at ${companyName} — Apply Now!`;

    const deadlineStr = applicationDeadline
      ? new Date(applicationDeadline).toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";

    const salaryFormatted = salary
      ? `₹${Number(salary).toLocaleString("en-IN")} LPA`
      : "Competitive";

    // Truncate description for email preview
    const shortDesc = jobDescription
      ? jobDescription.length > 250
        ? jobDescription.substring(0, 250) + "..."
        : jobDescription
      : "Check the portal for full job details.";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 10px 0 0; font-size: 15px; opacity: 0.9; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 12px; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
        .message { font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 24px; }
        .job-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .job-card table { width: 100%; border-collapse: collapse; }
        .job-card td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
        .job-card td:first-child { font-weight: 700; color: #475569; width: 150px; }
        .job-card td:last-child { color: #1e293b; }
        .job-card tr:last-child td { border-bottom: none; }
        .desc-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0; font-size: 14px; line-height: 1.6; color: #475569; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-top: 20px; box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
        .deadline-alert { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #92400e; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 New Job Opportunity!</h1>
          <p>${jobTitle} at ${companyName}</p>
          <span class="badge">🔥 Just Posted</span>
        </div>
        <div class="content">
          <div class="greeting">Hi ${userName || "there"},</div>
          <p class="message">
            Great news! A new job matching your interests has just been posted on <strong>InsiderJobs</strong>. 
            Check out the details below and apply before the deadline!
          </p>
          ${matchReasons.length ? `<p class="message" style="background:#eef2ff;border-radius:8px;padding:10px 14px;font-size:13px;">🎯 <strong>Why you got this:</strong> it matches your profile (${matchReasons.slice(0, 5).map(escapeHtml).join(", ")}). You can change your job alert preferences in My Applications on InsiderJobs.</p>` : ""}

          <div class="job-card">
            <table>
              <tr>
                <td>💼 Job Title</td>
                <td><strong>${jobTitle}</strong></td>
              </tr>
              <tr>
                <td>🏢 Company</td>
                <td>${companyName}</td>
              </tr>
              <tr>
                <td>📍 Location</td>
                <td>${location || "Not specified"}</td>
              </tr>
              <tr>
                <td>💰 Salary</td>
                <td>${salaryFormatted}</td>
              </tr>
              <tr>
                <td>📊 Level</td>
                <td>${level || "Not specified"}</td>
              </tr>
              <tr>
                <td>🏷️ Category</td>
                <td>${category || "Not specified"}</td>
              </tr>
              <tr>
                <td>📅 Apply Before</td>
                <td><strong style="color: #dc2626;">${deadlineStr}</strong></td>
              </tr>
            </table>
          </div>

          <div class="desc-box">
            <strong style="color: #1e293b;">📝 Job Description:</strong><br/><br/>
            ${shortDesc}
          </div>

          <div class="deadline-alert">
            <strong>⏰ Don't miss out!</strong> The application deadline is <strong>${deadlineStr}</strong>. 
            Make sure to apply early as positions fill up quickly.
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-btn">
              🔍 View Job & Apply Now
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            Happy job hunting! 🎯<br/>
            <strong>InsiderJobs Team</strong>
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} InsiderJobs Portal. All rights reserved.</p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #94a3b8;">
            You received this email because you are a registered user on InsiderJobs.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: emailSender(),
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log(`✉ New job notification sent to ${userEmail} [MessageID: ${info.messageId}]`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error(`Failed to send new job email to ${userEmail}:`, error.message);
    throw error;
  }
};
