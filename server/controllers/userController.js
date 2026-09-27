import mongoose from "mongoose";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import { v2 as cloudinary } from "cloudinary";
import { getAuth } from "@clerk/express";

// Helper function to reliably find or provision user in MongoDB
const findOrCreateUser = async ({ userId, name, email, image }) => {
  let user = null;

  if (userId) {
    user = await User.findById(userId);
  }

  if (!user && email) {
    user = await User.findOne({ email });
    if (user && userId && user._id !== userId) {
      user._id = userId;
      await user.save();
    }
  }

  if (!user && userId) {
    const fallbackEmail = email || `${userId}@clerk.user`;
    const existingByEmail = await User.findOne({ email: fallbackEmail });
    if (existingByEmail) {
      user = existingByEmail;
    } else {
      user = await User.create({
        _id: userId,
        name: name || "Applicant",
        email: fallbackEmail,
        image: image || "",
        resume: "",
        savedJobs: [],
      });
    }
  }

  return user;
};


// get user data
export const getUserData = async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const user = await findOrCreateUser({ userId });

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get User Data Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId, name, email, image } = req.body;
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please sign in.",
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user has already applied for this job
    const alreadyApplied = await JobApplication.findOne({
      userId,
      jobId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Ensure User exists in DB
    await findOrCreateUser({ userId, name, email, image });

    // Create new job application
    const jobApplication = new JobApplication({
      userId,
      companyId: job.companyId,
      jobId,
      date: Date.now(),
    });

    await jobApplication.save();

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      application: jobApplication,
    });

  } catch (error) {
    console.error("Apply For Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get user applied applications
export const getUserJobApplications = async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary")
      .exec();

    return res.status(200).json({
      success: true,
      applications: applications || [],
    });

  } catch (error) {
    console.error("Get User Job Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update user profile(resume)
// update user profile(resume)
export const updateUserResume = async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const resume = req.file;

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const user = await findOrCreateUser({
      userId,
      name: req.body.name,
      email: req.body.email,
    });

    // Use local static server URL to guarantee inline PDF viewing without blank tab issues
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const resumeUrl = `${protocol}://${host}/uploads/${resume.filename}`;

    // Optionally backup to Cloudinary in background
    if (resume && resume.path) {
      cloudinary.uploader.upload(resume.path, {
        resource_type: "raw",
        folder: "resumes",
      }).catch((cldErr) => console.warn("Cloudinary backup notice:", cldErr.message));
    }

    user.resume = resumeUrl;
    await user.save();


    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      resume: user.resume,
    });

  } catch (error) {
    console.error("Update User Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// toggle save job
export const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please sign in.",
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const user = await findOrCreateUser({ userId });
    const savedSet = new Set(user.savedJobs || []);
    let isSaved = false;

    if (savedSet.has(jobId.toString())) {
      savedSet.delete(jobId.toString());
      isSaved = false;
    } else {
      savedSet.add(jobId.toString());
      isSaved = true;
    }

    user.savedJobs = Array.from(savedSet);
    await user.save();

    return res.status(200).json({
      success: true,
      message: isSaved ? "Job saved to bookmarks" : "Job removed from bookmarks",
      isSaved,
      savedJobs: user.savedJobs,
    });

  } catch (error) {
    console.error("Toggle Save Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get user saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const user = await findOrCreateUser({ userId });
    const savedIds = user.savedJobs || [];

    const validObjectIds = savedIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const jobs = await Job.find({ _id: { $in: validObjectIds } }).populate("companyId", "name email image");

    return res.status(200).json({
      success: true,
      savedIds,
      jobs: jobs || [],
    });

  } catch (error) {
    console.error("Get Saved Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};