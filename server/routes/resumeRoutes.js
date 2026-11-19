import express from "express";
import multer from "multer";
import { parseResumeFile, detectFileType } from "../utils/resumeParser.js";

const router = express.Router();

// Kept in memory only: the file is read and thrown away, never saved to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

// Simple per-IP limit, because each read can call the paid AI service.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map();
export const rateLimit = (req, res, next) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return res.status(429).json({ success: false, message: "Too many resumes read. Please wait a few minutes and try again." });
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  next();
};

const singleFile = (req, res, next) =>
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE" ? "File must be under 5MB." : "Could not read the uploaded file.";
    return res.status(400).json({ success: false, message });
  });

// POST /api/resume/parse  (form field "resume": PDF, DOCX or TXT)
router.post("/parse", rateLimit, singleFile, async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Please choose a resume file." });
  if (detectFileType(req.file) === "unknown") {
    return res.status(400).json({ success: false, message: "Please upload a PDF, Word (.docx) or text file." });
  }
  try {
    const result = await parseResumeFile(req.file);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(422).json({ success: false, message: error.message || "This resume could not be read." });
  }
});

export default router;
