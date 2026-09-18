import Job from "../models/Job.js";
import { analyzeJobMatch } from "../utils/skillMatcher.js";

// get all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ visible: true })
      .populate({
        path: "companyId",
        select: "-password",
      });

    return res.status(200).json({
      success: true,
      jobs,
    });

  } catch (error) {
    console.error("Get Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get single job by id
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate({
        path: "companyId",
        select: "-password",
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });

  } catch (error) {
    console.error("Get Job By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// AI Resume -> Job Match controller
export const matchJobWithResume = async (req, res) => {
  try {
    const { jobId, jobTitle, jobDescription, resumeText } = req.body;

    let targetTitle = jobTitle || "";
    let targetDescription = jobDescription || "";

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        targetTitle = targetTitle || job.title;
        targetDescription = targetDescription || job.description;
      }
    }

    if (!targetDescription && !targetTitle) {
      return res.status(400).json({
        success: false,
        message: "Job ID or Job description is required",
      });
    }

    const matchAnalysis = analyzeJobMatch(
      resumeText || "",
      targetDescription,
      targetTitle
    );

    return res.status(200).json({
      success: true,
      ...matchAnalysis,
    });

  } catch (error) {
    console.error("Match Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};