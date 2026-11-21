import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true }, title: { type: String, required: true, maxlength: 120 },
  description: { type: String, default: "", maxlength: 2000 }, language: { type: String, default: "", maxlength: 60 },
  sourceUrl: { type: String, default: "", maxlength: 1000 }, demoUrl: { type: String, default: "", maxlength: 1000 },
}, { _id: false });
const fields = Object.fromEntries(["name", "headline", "email", "phone", "location", "github", "linkedin", "website", "summary", "education", "experience", "certifications", "resumeProjects"].map((key) => [key, { type: String, default: "", maxlength: ["summary", "education", "experience", "certifications", "resumeProjects"].includes(key) ? 4000 : 1000 }]));
const portfolioSchema = new mongoose.Schema({
  ...fields, userId: { type: String, required: true, unique: true, ref: "User" },
  skills: [{ type: String, maxlength: 60 }], projects: { type: [projectSchema], default: [] },
  theme: { type: String, enum: ["studio", "midnight"], default: "studio" },
  accent: { type: String, enum: ["indigo", "teal", "rose"], default: "indigo" },
  photo: { type: String, default: "", maxlength: 700000 },
  revision: { type: Number, default: 1, min: 1 },
}, { timestamps: true });
export default mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);
