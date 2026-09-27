import "dotenv/config";
import "./config/instrument.js";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import clerkWebhooks from "./controllers/webhooks.js";
import connectDB from "./config/db.js";
import companyRoutes from "./routes/companyRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import {clerkMiddleware} from "@clerk/express";

import path from "path";

const app = express();

// Connect MongoDB
await connectDB();
await connectCloudinary();
// Middlewares
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(clerkMiddleware());
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Express static serving with explicit PDF & text inline headers + CORS for PDF viewer
app.use("/uploads", (req, res, next) => {
  const filePath = path.join(process.cwd(), "uploads", req.path);
  const ext = path.extname(filePath).toLowerCase();

  // Allow cross-origin access for browser PDF viewer
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");

  if (ext === ".pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
  } else if (ext === ".txt") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "inline");
  } else if ([".doc", ".docx"].includes(ext)) {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment");
  }
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
}, express.static(path.join(process.cwd(), "uploads"), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
}));




// Routes
app.get("/", (req, res) => {
  res.send("API is Running...");
});
app.get("/debug-sentry", (req, res) => {
  throw new Error("Sentry verification successful!");
});

// // Test Sentry
// app.get("/debug-sentry", () => {
//   throw new Error("My first Sentry error!");
// });
app.post('/webhooks',clerkWebhooks);
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);

// Sentry Error Handler (Keep this at the end)
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});