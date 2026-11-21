import mongoose from "mongoose";
import LearningRoadmap from "../models/LearningRoadmap.js";
import { generateLearningRoadmap, validateLearningRequest, roadmapProgress, RoadmapError, MAX_NODES } from "../utils/learningRoadmap.js";

const serialize = (doc) => {
  const roadmap = doc.toObject ? doc.toObject() : doc;
  const { userId: _owner, __v: _version, ...publicFields } = roadmap;
  return { ...publicFields, progress: roadmapProgress(roadmap) };
};
const fail = (res, error) => res.status(error instanceof RoadmapError ? error.status : 500).json({
  success: false,
  message: error instanceof RoadmapError ? error.message : "Could not save or load your roadmap. Please try again.",
  retryable: error instanceof RoadmapError && [429, 502, 503, 504].includes(error.status) && ![400, 401, 403, 404].includes(Number(error.cause?.status)),
});
const ownerFilter = (req) => ({ _id: req.params.id, userId: req.roadmapUserId });
const missing = (res) => res.status(404).json({ success: false, message: "Roadmap or topic not found." });

// Factory lets request tests use a controlled AI response without contacting Gemini.
export const createRoadmapController = ({ generate = generateLearningRoadmap } = {}) => ({
  generate: async (req, res) => {
    try {
      const input = validateLearningRequest(req.body);
      const content = await generate(input);
      const roadmap = await LearningRoadmap.create({ ...input, ...content, userId: req.roadmapUserId });
      res.status(201).json({ success: true, roadmap: serialize(roadmap) });
    } catch (error) { fail(res, error); }
    finally { req.releaseGeneration?.(); }
  },
  list: async (req, res) => {
    try {
      const docs = await LearningRoadmap.find({ userId: req.roadmapUserId })
        .select("skill level hoursPerWeek title description nodes.id nodes.completed nodes.estimatedHours createdAt updatedAt")
        .sort({ updatedAt: -1 }).limit(50).lean();
      const roadmaps = docs.map((doc) => {
        const { nodes: _nodes, ...summary } = serialize(doc);
        return summary;
      });
      res.json({ success: true, roadmaps });
    } catch (error) { fail(res, error); }
  },
  get: async (req, res) => {
    try {
      const roadmap = await LearningRoadmap.findOne(ownerFilter(req)).lean();
      if (!roadmap) return missing(res);
      res.json({ success: true, roadmap: serialize(roadmap) });
    } catch (error) { fail(res, error); }
  },
  complete: async (req, res) => {
    if (typeof req.body?.completed !== "boolean") {
      return res.status(400).json({ success: false, message: "Completion must be true or false." });
    }
    try {
      // Update one topic atomically; concurrent updates to other topics cannot overwrite it.
      const roadmap = await LearningRoadmap.findOneAndUpdate(
        { ...ownerFilter(req), "nodes.id": req.params.nodeId },
        { $set: { "nodes.$.completed": req.body.completed } },
        { new: true, runValidators: true },
      ).lean();
      if (!roadmap) return missing(res);
      res.json({ success: true, roadmap: serialize(roadmap) });
    } catch (error) { fail(res, error); }
  },
  layout: async (req, res) => {
    const positions = req.body?.positions;
    if (!Array.isArray(positions) || !positions.length || positions.length > MAX_NODES ||
        positions.some((p) => !p || typeof p.id !== "string" || !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.x) > 100000 || Math.abs(p.y) > 100000) ||
        new Set(positions.map((p) => p.id)).size !== positions.length) {
      return res.status(400).json({ success: false, message: "Invalid roadmap positions." });
    }
    try {
      const roadmap = await LearningRoadmap.findOne(ownerFilter(req)).select("nodes.id").lean();
      if (!roadmap) return missing(res);
      const ids = new Set(roadmap.nodes.map((node) => node.id));
      if (positions.some((p) => !ids.has(p.id))) return missing(res);
      const updated = await LearningRoadmap.updateOne(ownerFilter(req), {
        $set: Object.fromEntries(positions.map((p, i) => [`nodes.$[node${i}].position`, { x: p.x, y: p.y }])),
      }, {
        arrayFilters: positions.map((p, i) => ({ [`node${i}.id`]: p.id })), runValidators: true,
      });
      if (!updated.matchedCount) return missing(res);
      res.json({ success: true });
    } catch (error) { fail(res, error); }
  },
});

export const validateRoadmapId = (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid roadmap address." });
  }
  next();
};
