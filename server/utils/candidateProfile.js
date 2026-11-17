import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const hasDeliverableEmail = (email) => typeof email === "string" &&
  /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/.test(email) && !email.toLowerCase().endsWith("@clerk.user");

// Never trust a recruiter- or browser-supplied address for status notifications.
// Repair legacy placeholder records using the authenticated provider's primary email.
export const ensureCandidateProfile = async (userId, provider = clerkClient) => {
  if (!userId) return null;
  const existing = await User.findById(userId);
  if (existing && hasDeliverableEmail(existing.email)) return existing;
  const profile = await provider.users.getUser(userId);
  const primaryEmail = profile.emailAddresses.find((email) => email.id === profile.primaryEmailAddressId);
  const email = primaryEmail?.emailAddress?.trim();
  if (!hasDeliverableEmail(email)) throw new Error("Candidate has no registered primary email address.");
  return User.findOneAndUpdate({ _id: userId }, {
    $set: {
      name: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username || "Applicant",
      email,
      image: profile.imageUrl || "",
    },
    $setOnInsert: { resume: "", savedJobs: [] },
  }, { upsert: true, new: true, runValidators: true });
};
