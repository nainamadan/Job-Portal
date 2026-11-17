import "dotenv/config";
import { createTransporter, emailSender } from "../utils/emailTransport.js";

try {
  if (!emailSender()) throw new Error("Configure EMAIL_FROM with an authorized sender address.");
  const transporter = await createTransporter();
  await transporter.verify();
  console.log("SMTP connection and authentication succeeded. No email was sent.");
  transporter.close();
} catch (error) {
  console.error("Email verification failed!");
  console.error("Code:", error.code);
  console.error("Message:", error.message);
  console.error("Command:", error.command);
  console.error("Cause:", error.cause?.message);

  process.exitCode = 1;
}
  
