import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  status: {
    type: String,
    default: "pending",
  },

  // Revision guards prevent an older mail attempt from overwriting a newer result.
  statusRevision: { type: Number, default: 0 },

  // Hiring process stage (see utils/hiringStages.js). Older records may not have it yet;
  // currentStage() works it out from `status` for them.
  stage: {
    type: String,
    enum: ["applied", "under_review", "shortlisted", "interview", "offered", "hired", "rejected"],
  },
  // Every stage change, shown to the candidate as a timeline.
  stageHistory: [
    {
      stage: { type: String, required: true },
      note: { type: String, default: "" },
      at: { type: Date, default: Date.now },
    },
  ],
  interviewDetails: {
    date: String,
    time: String,
    // Must be written as { type: String }. A bare `type: String` makes Mongoose treat the
    // whole interviewDetails object as a String, which broke saving Accepted (and its email).
    type: { type: String },
    link: String,
    location: String,
    notes: String,
  },
  feedback: String,
  statusNotification: {
    state: { type: String, enum: ["sending", "sent", "failed", "not_required"] },
    updatedAt: Date,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const JobApplication = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);

export default JobApplication;
