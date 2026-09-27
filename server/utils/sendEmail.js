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

    const subMessage = isAccepted
      ? "Our recruitment team will get in touch with you shortly with further instructions regarding onboarding and next steps."
      : isRejected
      ? "We were impressed with your qualifications and encourage you to apply for future roles that match your background."
      : "Please log in to your dashboard for further updates.";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: ${accentColor}; padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; tracking-tight; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
        .message { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px; }
        .box { background: #f1f5f9; border-left: 4px solid ${accentColor}; padding: 16px 20px; border-radius: 8px; font-size: 14px; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; background: ${accentColor}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusHeading}</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${candidateName},</div>
          <p class="message">${bodyMessage}</p>
          <div class="box">
            <strong>Job Title:</strong> ${jobTitle}<br/>
            <strong>Company:</strong> ${companyName}<br/>
            <strong>Updated Status:</strong> <span style="color: ${accentColor}; font-weight: bold;">${status}</span>
          </div>
          <p class="message">${subMessage}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            Best regards,<br/>
            <strong>${companyName} Recruitment Team</strong>
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} InsiderJobs Portal. All rights reserved.
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
