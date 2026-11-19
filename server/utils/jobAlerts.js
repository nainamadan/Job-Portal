import mongoose from "mongoose";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import { sendNewJobNotificationEmail } from "./sendEmail.js";
import { matchJobToUser } from "./jobAlertMatcher.js";
import { hasDeliverableEmail } from "./candidateProfile.js";

/**
 * Emails a newly posted job only to users whose profile fits it.
 * Returns a small summary (useful for logs and tests). Never throws.
 */
export const notifyMatchingUsers = async (job, companyName, send = sendNewJobNotificationEmail) => {
  const summary = { checked: 0, matched: 0, sent: 0, failed: 0 };
  try {
    const users = await User.find({}, "name email savedJobs jobPreferences").lean();

    // Collect each user's past activity (applied + saved jobs) in two bulk queries.
    const applications = await JobApplication.find({}, "userId jobId").lean();
    const historyIds = new Map(); // userId -> Set(jobId)
    const add = (userId, jobId) => {
      if (!jobId || String(jobId) === String(job._id) || !mongoose.isValidObjectId(String(jobId))) return;
      if (!historyIds.has(userId)) historyIds.set(userId, new Set());
      historyIds.get(userId).add(String(jobId));
    };
    for (const a of applications) add(String(a.userId), a.jobId);
    for (const u of users) for (const id of u.savedJobs || []) add(String(u._id), id);

    const allIds = [...new Set([...historyIds.values()].flatMap((s) => [...s]))];
    const pastJobs = allIds.length
      ? await Job.find({ _id: { $in: allIds } }, "title category description location level").lean()
      : [];
    const jobsById = new Map(pastJobs.map((j) => [String(j._id), j]));

    const sends = [];
    for (const user of users) {
      if (!hasDeliverableEmail(user.email)) continue;
      summary.checked += 1;
      const history = [...(historyIds.get(String(user._id)) || [])].map((id) => jobsById.get(id)).filter(Boolean);
      const { match, reasons } = matchJobToUser(job, user, history);
      if (!match) continue;
      summary.matched += 1;
      sends.push(
        send({
          userEmail: user.email,
          userName: user.name || "User",
          jobTitle: job.title,
          companyName,
          location: job.location,
          salary: job.salary,
          level: job.level,
          category: job.category,
          applicationDeadline: job.applicationDeadline,
          jobDescription: job.description,
          matchReasons: reasons,
        })
          .then(() => { summary.sent += 1; })
          .catch((err) => {
            summary.failed += 1;
            console.error("New job alert failed:", err.code || err.message);
          })
      );
    }
    await Promise.all(sends);
    console.log(`📧 New job alerts for "${job.title}": ${summary.matched} of ${summary.checked} users matched, ${summary.sent} sent, ${summary.failed} failed.`);
  } catch (error) {
    console.error("New job alerts could not be prepared:", error.message);
  }
  return summary;
};
