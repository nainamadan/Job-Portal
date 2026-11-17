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
  interviewDetails: {
    date: String,
    time: String,
    type: String,
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
