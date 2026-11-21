import express from "express";
import { getAuth } from "@clerk/express";
import { protectCompany } from "../middleware/authMiddleware.js";
import { SKILL_CHALLENGES } from "../utils/skillProof.js";
import { listMyProofs, createProof, updateProof, deleteProof, listApplicantProofs, reviewProof, validateProofIds } from "../controllers/skillProofController.js";

const router = express.Router();
const requireCandidate = (req, res, next) => {
  let userId;
  try { userId = getAuth(req)?.userId; } catch { /* Compatible with the existing Clerk auth-object middleware. */ }
  userId ||= typeof req.auth === "object" ? req.auth?.userId : null;
  if (!userId) return res.status(401).json({ success: false, message: "Sign in to manage your Skill Proof Vault." });
  req.proofUserId = userId;
  next();
};

router.get("/challenges", (_req, res) => res.json({ success: true, challenges: SKILL_CHALLENGES }));
router.get("/mine", requireCandidate, listMyProofs);
router.post("/mine", requireCandidate, createProof);
router.patch("/mine/:id", requireCandidate, validateProofIds, updateProof);
router.delete("/mine/:id", requireCandidate, validateProofIds, deleteProof);
router.get("/company/applications/:applicationId", protectCompany, validateProofIds, listApplicantProofs);
router.put("/company/applications/:applicationId/:id/review", protectCompany, validateProofIds, reviewProof);

export default router;
