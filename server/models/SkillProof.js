import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  companyName: { type: String, required: true },
  status: { type: String, enum: ["approved", "needs_work"], required: true },
  note: { type: String, required: true, maxlength: 1500 },
  reviewedAt: { type: Date, default: Date.now },
}, { _id: false });

const skillProofSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 120 },
  skills: [{ type: String, maxlength: 40 }],
  challengeId: { type: String, default: "" },
  summary: { type: String, required: true, maxlength: 3000 },
  contribution: { type: String, required: true, maxlength: 3000 },
  sourceUrl: { type: String, required: true, maxlength: 1500 },
  demoUrl: { type: String, default: "", maxlength: 1500 },
  writeupUrl: { type: String, default: "", maxlength: 1500 },
  revision: { type: Number, default: 1, min: 1 },
  reviews: { type: [reviewSchema], default: [] },
}, { timestamps: true });

skillProofSchema.index({ userId: 1, updatedAt: -1 });
export default mongoose.models.SkillProof || mongoose.model("SkillProof", skillProofSchema);
