import nodemailer from "nodemailer";

/**
 * Creates Nodemailer Transporter with ENV configuration or Ethereal fallback
 */
const createTransporter = async () => {
  // If SMTP environment variables exist, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("📧 Using SMTP transporter:", process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // If Gmail config exists in ENV
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    // Remove spaces from App Password (Google shows them in groups of 4)
    const cleanPass = (process.env.GMAIL_PASS || "").replace(/\s+/g, "");
    console.log(`📧 Using Gmail transporter: ${process.env.GMAIL_USER}`);
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: cleanPass,
      },
    });

    // Verify the connection works
    try {
      await transporter.verify();
      console.log("✅ Gmail SMTP connection verified successfully");
      return transporter;
    } catch (verifyErr) {
      console.error("❌ Gmail SMTP verification failed:", verifyErr.message);
      console.error("Hint: Make sure you are using a Gmail App Password (not your account password).");
      console.error("Generate one at: https://myaccount.google.com/apppasswords");
      // Don't throw - fall through to Ethereal fallback
    }
  }

  // Fallback to Ethereal test account with timeout protection
  try {
    console.log("📧 Attempting Ethereal test account...");
    const testAccount = await Promise.race([
      nodemailer.createTestAccount(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Ethereal connection timeout")), 5000))
    ]);

    console.log("📧 Ethereal test account created:", testAccount.user);
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn("⚠ Ethereal test account unavailable, using console mail logger:", err.message);
    return {
      sendMail: async (mailOptions) => {
        console.log("\n==================== EMAIL DISPATCH LOG ====================");
        console.log(`📬 TO: ${mailOptions.to}`);
        console.log(`📋 FROM: ${mailOptions.from}`);
        console.log(`📌 SUBJECT: ${mailOptions.subject}`);
        console.log("==============================================================\n");
        return { messageId: "local-log-" + Date.now() };
      }
    };
  }
};


/**
 * Sends automated Application Status Notification email to candidates
 * Includes detailed guidelines, meeting schedule (accepted) or improvement tips (rejected)
 */
export const sendApplicationStatusEmail = async ({
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
  status,
}) => {
  if (!candidateEmail) {
    console.warn("No candidate email provided for status notification");
    return;
  }

  try {
    const transporter = await createTransporter();
    const isAccepted = (status || "").toLowerCase() === "accepted";
    const isRejected = (status || "").toLowerCase() === "rejected";

    const subject = isAccepted
      ? `🎉 Application Accepted: You are selected for ${jobTitle} at ${companyName}`
      : isRejected
      ? `Update regarding your application for ${jobTitle} at ${companyName}`
      : `Status Update: Your application for ${jobTitle} is ${status}`;

    const accentColor = isAccepted ? "#10B981" : isRejected ? "#EF4444" : "#6366F1";
    const statusHeading = isAccepted
      ? "Congratulations! You have been Selected 🎉"
      : isRejected
      ? "Application Update"
      : `Application Status: ${status}`;

    const bodyMessage = isAccepted
      ? `We are thrilled to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been <strong>ACCEPTED</strong>!`
      : isRejected
      ? `Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.`
      : `Your application status for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to <strong>${status}</strong>.`;

    // Generate meeting date: 3 business days from now
    const meetingDate = new Date();
    let daysAdded = 0;
    while (daysAdded < 3) {
      meetingDate.setDate(meetingDate.getDate() + 1);
      const dayOfWeek = meetingDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) daysAdded++;
    }
    const meetingDateStr = meetingDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const meetingTimeStr = "11:00 AM IST";

    // Build the guidelines & extra sections based on status
    let guidelinesSection = "";

    if (isAccepted) {
      guidelinesSection = `
        <!-- Meeting Schedule -->
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10B981; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h2 style="margin: 0 0 16px 0; color: #065f46; font-size: 18px;">📅 Interview / Meeting Schedule</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: 700; color: #065f46; width: 140px;">📆 Date:</td>
              <td style="padding: 8px 12px; color: #047857;">${meetingDateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 700; color: #065f46;">⏰ Time:</td>
              <td style="padding: 8px 12px; color: #047857;">${meetingTimeStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 700; color: #065f46;">💻 Platform:</td>
              <td style="padding: 8px 12px; color: #047857;">Google Meet (link will be shared 1 hour before)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 700; color: #065f46;">⏱️ Duration:</td>
              <td style="padding: 8px 12px; color: #047857;">30 – 45 minutes</td>
            </tr>
          </table>
        </div>

        <!-- Guidelines for Accepted -->
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 14px 0; color: #14532d; font-size: 16px;">📋 Guidelines & Next Steps</h3>
          <ol style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 2;">
            <li><strong>Be on time</strong> — Join the meeting 5 minutes before the scheduled time.</li>
            <li><strong>Keep your resume ready</strong> — Have a printed/digital copy of your latest resume.</li>
            <li><strong>Carry valid ID proof</strong> — Aadhaar Card, PAN Card, or Passport (any one).</li>
            <li><strong>Dress Code</strong> — Business formals or smart casuals are recommended.</li>
            <li><strong>Stable Internet</strong> — Ensure a good internet connection with working camera & mic.</li>
            <li><strong>Prepare introduction</strong> — Be ready with a 2-minute self-introduction covering your skills & experience.</li>
            <li><strong>Research the company</strong> — Go through the company's website and recent projects.</li>
            <li><strong>Ask questions</strong> — Prepare 2-3 thoughtful questions to ask the interviewer.</li>
          </ol>
        </div>

        <!-- Documents Required -->
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 14px 0; color: #1e3a5f; font-size: 16px;">📄 Documents to Keep Ready</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 2;">
            <li>Updated Resume / CV</li>
            <li>Valid Government ID Proof</li>
            <li>Educational Certificates & Mark Sheets</li>
            <li>Experience Letters (if any)</li>
            <li>Portfolio / Project Links (if applicable)</li>
            <li>Passport Size Photographs (2 copies)</li>
          </ul>
        </div>

        <div style="background: #fefce8; border-left: 4px solid #eab308; border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 13px; color: #854d0e;">
          <strong>⚠️ Important:</strong> If you are unable to attend the scheduled meeting, please reply to this email at least 24 hours in advance to reschedule. No-shows may result in cancellation of your candidacy.
        </div>
      `;
    } else if (isRejected) {
      guidelinesSection = `
        <!-- Feedback & Improvement Tips -->
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 14px 0; color: #7f1d1d; font-size: 16px;">💡 Tips for Future Applications</h3>
          <ol style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 14px; line-height: 2;">
            <li><strong>Tailor your resume</strong> — Customize your resume keywords to match each job description.</li>
            <li><strong>Upskill yourself</strong> — Consider online courses or certifications in your target domain.</li>
            <li><strong>Build projects</strong> — Hands-on projects and a strong portfolio stand out to recruiters.</li>
            <li><strong>Practice interviews</strong> — Use mock interview platforms to improve communication skills.</li>
            <li><strong>Network actively</strong> — Connect with professionals on LinkedIn and attend industry events.</li>
            <li><strong>Apply consistently</strong> — Don't give up! Every application is a learning experience.</li>
          </ol>
        </div>

        <div style="background: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 14px 0; color: #7c2d12; font-size: 16px;">🔄 What You Can Do Next</h3>
          <ul style="margin: 0; padding-left: 20px; color: #9a3412; font-size: 14px; line-height: 2;">
            <li>Browse other open positions on InsiderJobs that match your profile.</li>
            <li>Use our <strong>ATS Resume Simulator</strong> to optimize your resume score.</li>
            <li>Update your skills and experience on your profile regularly.</li>
            <li>Set up job alerts to get notified about similar roles instantly.</li>
          </ul>
        </div>

        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 14px; color: #166534;">
          <strong>🌟 Remember:</strong> A rejection is not a reflection of your worth. Many successful professionals faced multiple rejections before landing their dream jobs. Keep going — your opportunity is around the corner!
        </div>
      `;
    }

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
        .header { background: linear-gradient(135deg, ${accentColor} 0%, ${isAccepted ? '#059669' : isRejected ? '#dc2626' : '#4f46e5'} 100%); padding: 40px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
        .message { font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 24px; }
        .status-box { background: #f1f5f9; border-left: 4px solid ${accentColor}; padding: 16px 20px; border-radius: 8px; font-size: 14px; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusHeading}</h1>
          <p>${companyName} • ${jobTitle}</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${candidateName},</div>
          <p class="message">${bodyMessage}</p>

          <div class="status-box">
            <strong>📌 Job Title:</strong> ${jobTitle}<br/>
            <strong>🏢 Company:</strong> ${companyName}<br/>
            <strong>📊 Status:</strong> <span style="color: ${accentColor}; font-weight: bold; text-transform: uppercase;">${status}</span>
          </div>

          ${guidelinesSection}

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            Best regards,<br/>
            <strong>${companyName} Recruitment Team</strong>
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} InsiderJobs Portal. All rights reserved.</p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #94a3b8;">This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"${companyName} Hiring" <noreply@insiderjobs.com>`,
      to: candidateEmail,
      subject,
      html: htmlContent,
    });

    console.log(`✉ Status email sent to ${candidateEmail} [MessageID: ${info.messageId}]`);
    
    // If Ethereal test account was used, print preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error("Failed to send status email:", error.message);
  }
};


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
      from: `"InsiderJobs" <noreply@insiderjobs.com>`,
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
  }
};
