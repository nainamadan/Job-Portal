import Conversation from "../models/Conversation.js";
import JobApplication from "../models/JobAppliaction.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import User from "../models/User.js";

// When someone applies, their chat with the recruiter of THAT job starts with a welcome
// message sent on the recruiter's behalf. One conversation per job seeker per job.

export const buildWelcomeText = ({ candidateName, jobTitle, companyName }) => {
  const first = String(candidateName || "").trim().split(/\s+/)[0];
  return (
    `Hi${first ? ` ${first}` : ""}! 👋 Thanks for applying for ${jobTitle || "this role"} at ${companyName || "our company"}. ` +
    `We've received your application and our team will review it soon. ` +
    `You can follow your progress in My Applications, and message us here any time if you have questions about this job. 🙂`
  );
};

/**
 * Makes sure the conversation for (job, user) exists and contains the welcome message.
 * Safe to call repeatedly: the welcome is added at most once. Returns true if it was added.
 */
export const ensureWelcomeConversation = async ({ jobId, userId, companyId, text }) => {
  const welcome = { sender: "company", kind: "welcome", text };
  const now = new Date();

  // 1) New conversation: create it with the welcome as the first message.
  try {
    const created = await Conversation.updateOne(
      { jobId, userId },
      { $setOnInsert: { jobId, userId, companyId, messages: [welcome], lastMessageAt: now, userUnread: 1, companyUnread: 0 } },
      { upsert: true }
    );
    if (created.upsertedCount) return true;
  } catch (error) {
    if (error?.code !== 11000) throw error; // another request created it at the same moment
  }

  // 2) Conversation already existed (e.g. they messaged before applying): add the welcome once.
  const added = await Conversation.updateOne(
    { jobId, userId, "messages.kind": { $ne: "welcome" } },
    { $push: { messages: welcome }, $set: { lastMessageAt: now }, $inc: { userUnread: 1 } }
  );
  return added.modifiedCount > 0;
};

/** Welcome for one application, looking up the names it needs. Never throws. */
export const welcomeForApplication = async (application, { job, company, user } = {}) => {
  try {
    const [j, c, u] = await Promise.all([
      job || Job.findById(application.jobId).select("title companyId").lean(),
      company || Company.findById(application.companyId).select("name").lean(),
      user || User.findById(application.userId).select("name").lean(),
    ]);
    if (!j) return false;
    return await ensureWelcomeConversation({
      jobId: application.jobId,
      userId: String(application.userId),
      companyId: application.companyId || j.companyId,
      text: buildWelcomeText({ candidateName: u?.name, jobTitle: j.title, companyName: c?.name }),
    });
  } catch (error) {
    console.error("Welcome message could not be created:", error.message);
    return false;
  }
};

/**
 * Older applications (made before welcome messages existed) get their welcome chat the
 * first time Messages is opened. `filter` is { userId } or { companyId }.
 */
export const backfillWelcomes = async (filter) => {
  try {
    const applications = await JobApplication.find(filter, "jobId userId companyId").lean();
    if (!applications.length) return 0;
    const existing = await Conversation.find(
      { ...filter, jobId: { $in: applications.map((a) => a.jobId) }, "messages.kind": "welcome" },
      "jobId userId"
    ).lean();
    const done = new Set(existing.map((c) => `${c.jobId}|${c.userId}`));
    const missing = applications.filter((a) => !done.has(`${a.jobId}|${a.userId}`));
    let added = 0;
    for (const a of missing) if (await welcomeForApplication(a)) added += 1;
    return added;
  } catch (error) {
    console.error("Welcome backfill failed:", error.message);
    return 0;
  }
};
