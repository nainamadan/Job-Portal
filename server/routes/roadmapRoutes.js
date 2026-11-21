import express from "express";
import { getAuth } from "@clerk/express";
import { createRoadmapController, validateRoadmapId } from "../controllers/roadmapController.js";
import { validateLearningRequest } from "../utils/learningRoadmap.js";

export const requireRoadmapUser = (req, res, next) => {
  let userId;
  try { userId = getAuth(req)?.userId; } catch { /* Older Clerk middleware uses an auth object. */ }
  userId ||= typeof req.auth === "object" ? req.auth?.userId : null;
  if (!userId) return res.status(401).json({ success: false, message: "Please sign in to create and save learning roadmaps." });
  req.roadmapUserId = userId;
  next();
};

// Per signed-in user, with a bounded, expiring in-memory map. No paid AI calls for guests.
export const createGenerationLimit = ({ now = Date.now } = {}) => {
  const users = new Map();
  const windowMs = 10 * 60 * 1000;
  return (req, res, next) => {
    try { validateLearningRequest(req.body); } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    const time = now();
    for (const [key, value] of users) if (!value.pending && time - value.start >= windowMs) users.delete(key);
    const state = users.get(req.roadmapUserId) || { start: time, count: 0, pending: false };
    if (state.pending || state.count >= 5 || (!users.has(req.roadmapUserId) && users.size >= 10000)) {
      res.set("Retry-After", state.pending ? "30" : String(Math.max(1, Math.ceil((state.start + windowMs - time) / 1000))));
      return res.status(429).json({ success: false, message: state.pending ? "Your roadmap is still being generated." : "You have generated several roadmaps. Please wait a few minutes and try again." });
    }
    state.count++;
    state.pending = true;
    users.set(req.roadmapUserId, state);
    // A disconnected browser must not release the AI concurrency lock early.
    req.releaseGeneration = () => { state.pending = false; };
    next();
  };
};

export const createRoadmapRouter = (options) => {
  const router = express.Router();
  const controller = createRoadmapController(options);
  router.use(requireRoadmapUser);
  router.get("/", controller.list);
  router.post("/generate", createGenerationLimit(), controller.generate);
  router.use("/:id", validateRoadmapId);
  router.get("/:id", controller.get);
  router.patch("/:id/nodes/:nodeId", controller.complete);
  router.patch("/:id/layout", controller.layout);
  return router;
};

export default createRoadmapRouter();
