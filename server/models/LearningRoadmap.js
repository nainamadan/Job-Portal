import mongoose from "mongoose";
import { LEVELS, NODE_KINDS } from "../utils/learningRoadmap.js";

const resourceSchema = new mongoose.Schema({ title: String, url: String }, { _id: false });
const positionSchema = new mongoose.Schema({ x: Number, y: Number }, { _id: false });
const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  kind: { type: String, enum: NODE_KINDS, required: true },
  summary: String, explanation: String,
  estimatedHours: { type: Number, required: true, min: 0.25, max: 80 },
  exercises: [String], documentation: [resourceSchema], youtubeQuery: String,
  completed: { type: Boolean, default: false },
  position: { type: positionSchema, default: undefined },
}, { _id: false });
const edgeSchema = new mongoose.Schema({ id: String, source: String, target: String }, { _id: false });
const roadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  skill: { type: String, required: true, maxlength: 100 },
  level: { type: String, enum: LEVELS, required: true },
  hoursPerWeek: { type: Number, required: true, min: 1, max: 40 },
  title: { type: String, required: true }, description: String,
  nodes: [nodeSchema], edges: [edgeSchema],
}, { timestamps: true });

roadmapSchema.index({ userId: 1, updatedAt: -1 });
export default mongoose.models.LearningRoadmap || mongoose.model("LearningRoadmap", roadmapSchema);
