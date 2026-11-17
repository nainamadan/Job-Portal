// import nodemailer from "nodemailer";

// export const emailSender = () => process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;

// // Missing/broken credentials must never fall back to fake delivery or a test inbox.
// export const createTransporter = async () => {
//   const common = { connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 };
//   if ([process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS].some(Boolean) &&
//     ![process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS].every(Boolean)) {
//     throw new Error("SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER and SMTP_PASS together.");
//   }
//   if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
//     const port = Number(process.env.SMTP_PORT || 587);
//     if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid SMTP_PORT.");
//     if (process.env.SMTP_SECURE && !["true", "false"].includes(process.env.SMTP_SECURE)) {
//       throw new Error("SMTP_SECURE must be true or false.");
//     }
//     return nodemailer.createTransport({
//       ...common, host: process.env.SMTP_HOST, port,
//       secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//     });
//   }
//   if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
//     return nodemailer.createTransport({ ...common, service: "gmail",
//       auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS.replace(/\s+/g, "") },
//     });
//   }
//   throw new Error("Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM, or GMAIL_USER and GMAIL_PASS.");
// };



import nodemailer from "nodemailer";

export const emailSender = () =>
  process.env.EMAIL_FROM ||
  process.env.SMTP_USER ||
  process.env.GMAIL_USER;

export const createTransporter = async () => {
  const common = {
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  };

  const {
    SMTP_HOST,
    SMTP_USER,
    SMTP_PASS,
    SMTP_PORT,
    SMTP_SECURE,
  } = process.env;

  if (SMTP_HOST || SMTP_USER || SMTP_PASS) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error("Incomplete SMTP configuration.");
    }

    const port = Number(SMTP_PORT || 587);

    return nodemailer.createTransport({
      ...common,
      host: SMTP_HOST,
      port,
      secure: SMTP_SECURE === "true",
      family: 4,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS.replace(/\s+/g, ""),
      },
    });
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      ...common,
      service: "gmail",
      family: 4,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS.replace(/\s+/g, ""),
      },
    });
  }

  throw new Error("Email credentials are missing.");
};
