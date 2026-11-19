import express from "express";
import { protectCompany } from "../middleware/authMiddleware.js";
import {
  getUserConversations,
  getUserConversationForJob,
  sendUserMessage,
  getCompanyConversations,
  getCompanyConversation,
  sendCompanyReply,
} from "../controllers/messageController.js";

const router = express.Router();

// Job seeker (signed in with Clerk)
router.get("/user/conversations", getUserConversations);
router.get("/user/job/:jobId", getUserConversationForJob);
router.post("/user/send", sendUserMessage);

// Recruiter (company token)
router.get("/company/conversations", protectCompany, getCompanyConversations);
router.get("/company/conversations/:id", protectCompany, getCompanyConversation);
router.post("/company/conversations/:id/reply", protectCompany, sendCompanyReply);

export default router;
