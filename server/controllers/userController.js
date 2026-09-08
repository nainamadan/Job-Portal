import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import {v2 as cloudinary} from "cloudinary";

// getuser data
export const getUserData = async (req, res) => {
  try {
    // Get user ID from Clerk authentication middleware
    const userId = req.auth.userId;

    // Find the user in User model using Clerk user ID
    const user = await User.findById(userId);

    // If user is not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send user data
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
    // Get job ID from request body
    const { jobId } = req.body;

    // Get logged-in user ID from Clerk middleware
    const userId = req.auth.userId;

    // Check if job ID is provided
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Find the job using job ID
    const job = await Job.findById(jobId);

    // Check if job exists
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

    // Create new job application
    const jobApplication = new JobApplication({
      userId,
      companyId: job.companyId,
      jobId,
      date:Date.now(),
    });

    // Save the application
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
    // Get logged-in user ID from Clerk middleware
    const userId = req.auth.userId;

    // Find all applications submitted by this user
    const applications = await JobApplication.find({ userId })
      .populate("companyId" ,'name email image')
      .populate("jobId",'title description location category level salary').exec();
if(!applications || applications.length === 0){
  return res.status(404).json({
    success: false,
    message: "No applications found for this user",
  });
}
    // Send applications
    return res.status(200).json({
      success: true,
      applications,
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

export const updateUserResume = async (req, res) => {
  try {
    // Get logged-in user ID from Clerk middleware
    const userId = req.auth.userId;

    // Get resume file from request
    const resume = req.file;

    // Check whether resume is provided
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Resume is required",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload resume to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(resume.path, {
      resource_type: "raw",
      folder: "resumes",
    });

    // Save Cloudinary URL
    user.resume = uploadResult.secure_url;

    // Save user
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