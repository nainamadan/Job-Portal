import mongoose from "mongoose";

// One conversation = one job seeker talking to the recruiter (company) about one job.
export const MAX_MESSAGE_LENGTH = 2000;

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "company"], required: true },
    text: { type: String, required: true, trim: true, maxlength: MAX_MESSAGE_LENGTH },
    // Set for messages the system sends for the recruiter, e.g. "welcome" when someone applies.
    kind: { type: String, enum: ["welcome"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const conversationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: String, ref: "User", required: true, index: true },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    // How many messages each side has not read yet.
    userUnread: { type: Number, default: 0 },
    companyUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// A job seeker has at most one conversation per job.
conversationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

export default Conversation;
