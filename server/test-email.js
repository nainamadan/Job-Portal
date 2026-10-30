import "dotenv/config";
import nodemailer from "nodemailer";

console.log("=== Email Debug Test ===");
console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? `${process.env.GMAIL_PASS.substring(0, 4)}****` : "NOT SET");
console.log("SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");

async function testEmail() {
  try {
    // Test Gmail connection
    const cleanPass = (process.env.GMAIL_PASS || "").replace(/\s+/g, "");
    console.log("\n📧 Testing Gmail SMTP connection...");
    console.log("Password length:", cleanPass.length);
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: cleanPass,
      },
    });

    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ Gmail SMTP verified successfully!");

    // Try sending a test email
    console.log("\n📤 Sending test email...");
    const info = await transporter.sendMail({
      from: `"InsiderJobs Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to self
      subject: "🧪 InsiderJobs Email Test - " + new Date().toLocaleTimeString(),
      html: "<h1>Test Email Working!</h1><p>If you see this, email is configured correctly.</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error("Error Code:", error.code);
    console.error("Error Command:", error.command);
    
    if (error.message.includes("Invalid login") || error.message.includes("AUTHENTICATIONFAILED")) {
      console.error("\n🔑 FIX: Your Gmail App Password is invalid or expired.");
      console.error("Steps to generate a new App Password:");
      console.error("1. Go to https://myaccount.google.com/apppasswords");
      console.error("2. Sign in with nainamadan567@gmail.com");
      console.error("3. Select 'Mail' as the app");
      console.error("4. Click 'Generate'");
      console.error("5. Copy the 16-character password");
      console.error("6. Update GMAIL_PASS in .env (no spaces needed)");
    }
    
    if (error.message.includes("less secure")) {
      console.error("\n🔑 FIX: Enable 2-Step Verification and use App Password instead.");
    }
  }
}

testEmail();
