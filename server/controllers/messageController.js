import mongoose from "mongoose";
import { getAuth } from "@clerk/express";
import Conversation, { MAX_MESSAGE_LENGTH } from "../models/Conversation.js";
import Job from "../models/Job.js";
import { ensureCandidateProfile } from "../utils/candidateProfile.js";
import JobApplication from "../models/JobAppliaction.js";
import { backfillWelcomes, welcomeForApplication } from "../utils/welcomeMessage.js";

// Signed-in job seeker id from Clerk (req.auth is accepted for tests and older middleware).
const getUserId = (req) => {
  try {
    const auth = getAuth(req);
    if (auth?.userId) return auth.userId;
  } catch {
    // Clerk middleware not present; fall through.
  }
  return req.auth?.userId || null;
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

// Returns cleaned text, or null when it is empty or too long.
export const cleanMessageText = (text) => {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null;
  return trimmed;
};

const badText = (res) =>
  res.status(400).json({
    success: false,
    message: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
  });

const notSignedIn = (res) =>
  res.status(401).json({ success: false, message: "Please sign in to send messages." });

// List view: everything except the full message history.
const summarize = (c, side) => {
  const last = c.messages?.[c.messages.length - 1];
  return {
    _id: c._id,
    job: c.jobId,
    company: c.companyId,
    user: c.userId,
    lastMessage: last ? { text: last.text, sender: last.sender, createdAt: last.createdAt } : null,
    lastMessageAt: c.lastMessageAt,
    unread: side === "user" ? c.userUnread : c.companyUnread,
  };
};

const JOB_FIELDS = "title location companyId";
const COMPANY_FIELDS = "name image";
const USER_FIELDS = "name image";

/* ---------------- Job seeker side ---------------- */

// GET /api/messages/user/conversations
export const getUserConversations = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return notSignedIn(res);
    await backfillWelcomes({ userId }); // older applications get their welcome chat

    const conversations = await Conversation.find({ userId })
      .sort({ lastMessageAt: -1 })
      .populate("jobId", JOB_FIELDS)
      .populate("companyId", COMPANY_FIELDS)
      .lean();

    res.json({ success: true, conversations: conversations.map((c) => summarize(c, "user")) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages/user/job/:jobId  (opens the thread and marks it read)
export const getUserConversationForJob = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return notSignedIn(res);
    const { jobId } = req.params;
    if (!isObjectId(jobId)) return res.status(400).json({ success: false, message: "Invalid job." });

    // If they applied to this job before welcome messages existed, start the chat now.
    const application = await JobApplication.findOne({ jobId, userId }, "jobId userId companyId").lean();
    if (application) await welcomeForApplication(application);

    const conversation = await Conversation.findOneAndUpdate(
      { jobId, userId },
      { $set: { userUnread: 0 } },
      { new: true }
    )
      .populate("jobId", JOB_FIELDS)
      .populate("companyId", COMPANY_FIELDS)
      .lean();

    res.json({ success: true, conversation: conversation || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/messages/user/send  { jobId, text }
export const sendUserMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return notSignedIn(res);

    const { jobId } = req.body || {};
    const text = cleanMessageText(req.body?.text);
    if (!isObjectId(jobId)) return res.status(400).json({ success: false, message: "Invalid job." });
    if (!text) return badText(res);

    const job = await Job.findById(jobId).select("companyId").lean();
    if (!job || !job.companyId) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Make sure the job seeker has a stored profile so recruiters can see their name.
    try {
      await ensureCandidateProfile(userId);
    } catch (profileError) {
      console.warn("Message profile check:", profileError.message);
    }

    const conversation = await Conversation.findOneAndUpdate(
      { jobId, userId },
      {
        $setOnInsert: { jobId, userId, companyId: job.companyId },
        $push: { messages: { sender: "user", text } },
        $set: { lastMessageAt: new Date(), userUnread: 0 },
        $inc: { companyUnread: 1 },
      },
      { new: true, upsert: true, runValidators: true }
    )
      .populate("jobId", JOB_FIELDS)
      .populate("companyId", COMPANY_FIELDS)
      .lean();

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------- Recruiter side (protectCompany sets req.companyId) ---------------- */

// GET /api/messages/company/conversations
export const getCompanyConversations = async (req, res) => {
  try {
    await backfillWelcomes({ companyId: req.companyId }); // older applications get their welcome chat
    const conversations = await Conversation.find({ companyId: req.companyId })
      .sort({ lastMessageAt: -1 })
      .populate("jobId", JOB_FIELDS)
      .populate("userId", USER_FIELDS)
      .lean();

    res.json({ success: true, conversations: conversations.map((c) => summarize(c, "company")) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages/company/conversations/:id  (opens the thread and marks it read)
export const getCompanyConversation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ success: false, message: "Invalid conversation." });

    // Filtering by companyId means a recruiter can never open another company's chat.
    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, companyId: req.companyId },
      { $set: { companyUnread: 0 } },
      { new: true }
    )
      .populate("jobId", JOB_FIELDS)
      .populate("userId", USER_FIELDS)
      .lean();

    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });
    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/messages/company/conversations/:id/reply  { text }
export const sendCompanyReply = async (req, res) => {
  try {
    const { id } = req.params;
    const text = cleanMessageText(req.body?.text);
    if (!isObjectId(id)) return res.status(400).json({ success: false, message: "Invalid conversation." });
    if (!text) return badText(res);

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, companyId: req.companyId },
      {
        $push: { messages: { sender: "company", text } },
        $set: { lastMessageAt: new Date(), companyUnread: 0 },
        $inc: { userUnread: 1 },
      },
      { new: true, runValidators: true }
    )
      .populate("jobId", JOB_FIELDS)
      .populate("userId", USER_FIELDS)
      .lean();

    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });
    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
