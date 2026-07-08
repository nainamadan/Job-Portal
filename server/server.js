import "./config/instrument.js";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import clerkWebhooks from "./controllers/webhooks.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Connect MongoDB
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("API is Running...");
});
app.get("/debug-sentry", (req, res) => {
  throw new Error("Sentry verification successful!");
});

// Test Sentry
app.get("/debug-sentry", () => {
  throw new Error("My first Sentry error!");
});
app.post('/webhooks',clerkWebhooks);
// Sentry Error Handler (Keep this at the end)
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});