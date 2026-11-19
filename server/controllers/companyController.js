import Company from "../models/Company.js";
import mongoose from "mongoose";
import { normalizeSalary } from "../utils/salary.js";
import { ensureCandidateProfile } from "../utils/candidateProfile.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobAppliaction.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken.js";
import { sendApplicationStatusEmail } from "../utils/sendEmail.js";
import { sendStageUpdateEmail } from "../utils/statusEmail.js";
import { MANUAL_STAGE_KEYS, MAX_STAGE_NOTE, stageLabel, stageToStatus, statusToStage } from "../utils/hiringStages.js";
import { notifyMatchingUsers } from "../utils/jobAlerts.js";



// Register a new company
// export const registerCompany = async (req, res) => {
//   try {
//     console.log("Register API Hit");

//     const { name, email, password } = req.body;
//     const image = req.file;

//     console.log(req.body);
//     console.log(req.file);

//     // Check fields
//     if (!name || !email || !password || !image) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Details",
//       });
//     }

//     // Company already exists
//     const companyExists = await Company.findOne({ email });

//     if (companyExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Company already exists",
//       });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     console.log("Uploading image...");

//     // Upload image to Cloudinary
//     const uploadResult = await cloudinary.uploader.upload(image.path, {
//       folder: "companies",
//        resource_type: "image",
//   type: "upload",
//     });

//     console.log("UPLOAD SUCCESS:", uploadResult.secure_url);

//     // Save company
//     const company = await Company.create({
//       name,
//       email,
//       password: hashedPassword,
//       image: uploadResult.secure_url,
//     });

//     // Generate Token
//     const token = generateToken(company._id);

//     return res.status(201).json({
//       success: true,
//       message: "Company Registered Successfully",
//       token,
//       company: {
//         _id: company._id,
//         name: company.name,
//         email: company.email,
//         image: company.image,
//       },
//     });

//   } catch (error) {
//     console.log("FULL CLOUDINARY ERROR");
//     console.dir(error, { depth: null });
//     console.log("HTTP CODE:", error.http_code);
//     console.log("ERROR MESSAGE:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// Register a new company
export const registerCompany = async (req, res) => {
  try {
    console.log("Register API Hit");

    const { name, email, password } = req.body;
    const image = req.file;

    console.log("Body:", req.body);
    console.log("Image:", req.file);

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    // Check if company already exists
    const companyExists = await Company.findOne({ email });

    if (companyExists) {
      return res.status(400).json({
        success: false,
        message: "Company already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary or use fallback
    let imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    if (image && image.path) {
      try {
        console.log("Uploading image to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(image.path, {
          folder: "companies",
        });
        if (uploadResult && uploadResult.secure_url) {
          imageUrl = uploadResult.secure_url;
          console.log("UPLOAD SUCCESS:", imageUrl);
        }
      } catch (cldError) {
        console.error("Cloudinary upload failed, using fallback avatar:", cldError.message);
      }
    }

    // Create company
    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    // Generate JWT token
    const token = generateToken(company._id);

    // Send response
    return res.status(201).json({
      success: true,
      message: "Company Registered Successfully",
      token,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });

  } catch (error) {
    console.error("========== REGISTER ERROR ==========");
    console.error("Message:", error.message);
    console.error("====================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// Get logged-in company profile
// Login company
// post=>/api/company/login
// body raw json email and password
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Find company by email
    // agr koi company hogi is email se toh vo company variable me aajegu
    const company = await Company.findOne({ email });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, company.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = generateToken(company._id);

    // Success Response
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get logged-in company profile
// Get logged-in company profile
export const getCompanyData = async (req, res) => {
  try {
    const companyId = req.companyId;

    const company = await Company.findById(companyId).select("-password");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      company,
    });

  } catch (error) {
    console.error("Get Company Data Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Post a new job
//  export const postJob = async (req, res) => {
//   try {
//     // Get job details from body
//     const { title, description, location, salary ,level,category} = req.body;

//     // Get company ID from protectCompany middleware
//     const companyId = req.companyId;

//     // Check details
//     console.log("Title:", title);
//     console.log("Description:", description);
//     console.log("Location:", location);
//     console.log("Salary:", salary);
//     console.log("Company ID:", companyId);

//     // Create new Job
//     const newJob = new Job({
//       title,
//       description,
//       location,
//       salary,
//       companyId,
//       date:Date.now(),
//       level,
// category,
//     });

//     // Save job
//     await newJob.save();

//     console.log("New Job:", newJob);

//     return res.status(201).json({
//       success: true,
//       message: "Job Posted Successfully",
//       job: newJob,
//     });

//   } catch (error) {
//     console.error("Post Job Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const postJob = async (req, res) => {
  let normalizedSalary;
  try {
    normalizedSalary = normalizeSalary(req.body.salary, req.body.salaryUnit || "LPA");
    if (normalizedSalary <= 0) throw new Error("Salary must be greater than zero.");
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  try {
    const {
      title,
      description,
      location,
      salary,
      level,
      category,
      applicationDurationDays,
    } = req.body;

    const companyId = req.companyId;

    // Validate required fields
    if (
      !title ||
      !description ||
      !location ||
      !salary ||
      !level ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required job details",
      });
    }

    // Validate application duration
    const allowedDurations = [7, 15, 30, 45, 60];
    const duration = Number(applicationDurationDays);

    if (!allowedDurations.includes(duration)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid application duration",
      });
    }

    const postedDate = new Date();

    // Calculate deadline from posting date
    // const applicationDeadline = new Date(postedDate);
    // applicationDeadline.setDate(
    //   applicationDeadline.getDate() + duration
    // );
    const applicationDeadline = new Date(postedDate);

applicationDeadline.setDate(
  applicationDeadline.getDate() + duration
);

applicationDeadline.setHours(23, 59, 59, 999);

    const newJob = new Job({
      title,
      description,
      location,
      salary: normalizedSalary,
      level,
      category,
      companyId,
      date: postedDate,
      applicationDurationDays: duration,
      applicationDeadline,
    });

    await newJob.save();

    // Email only the job seekers whose profile fits this job (background, non-blocking).
    // See utils/jobAlerts.js and utils/jobAlertMatcher.js for the matching rules.
    const company = await Company.findById(companyId).select("name");
    notifyMatchingUsers(newJob.toObject(), company?.name || "Company");

    return res.status(201).json({
      success: true,
      message: "Job Posted Successfully!",
      job: newJob,
    });
  } catch (error) {
    console.error("Post Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all jobs posted by company
export const getCompanyPostedJobs = async (req, res) => {
  try {
    const companyId = req.companyId;

    const jobs = await Job.find({ companyId });

    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id });
        return { ...job._doc, applicants: applicants.length };
      })
    );

    return res.status(200).json({
      success: true,
      jobsData,
      jobs: jobsData,
    });

  } catch (error) {
    console.error("Get Company Posted Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get applicants for company jobs
export const getJobApplicants = async (req, res) => {
  try {
    const companyId = req.companyId;

    const applications = await JobApplication.find({ companyId })
      .populate("userId", "name email image resume")
      .populate("jobId", "title location category level salary description")
      .exec();

    return res.status(200).json({
      success: true,
      applications: applications || [],
    });
  } catch (error) {
    console.error("Get Job Applicants Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getCompanyJobApplicants = getJobApplicants;

// Short timeline note for Accept / Reject decisions.
const stageNoteFor = (normalized, details) => {
  if (normalized === "accepted" && details.interviewDetails?.date) {
    const d = details.interviewDetails;
    return [`Interview on ${d.date}${d.time ? ` at ${d.time}` : ""}`, d.type, d.link || d.location].filter(Boolean).join(" · ");
  }
  if (normalized === "rejected" && details.feedback) return details.feedback;
  return "";
};

// Move an application to another hiring stage (not Interview / Not Selected, which use
// changeJobApplicationStatus so their details and emails are collected).
export const changeApplicationStage = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const stage = typeof req.body?.stage === "string" ? req.body.stage.trim() : "";
    const note = req.body?.note === undefined ? "" : req.body.note;
    const notifyCandidate = req.body?.notifyCandidate !== false;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ success: false, message: "Invalid application." });
    }
    if (stage === "interview" || stage === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Use Accept (Interview) or Reject so the interview details or feedback are included.",
      });
    }
    if (!MANUAL_STAGE_KEYS.includes(stage)) {
      return res.status(400).json({ success: false, message: "Unknown hiring stage." });
    }
    if (typeof note !== "string" || note.length > MAX_STAGE_NOTE) {
      return res.status(400).json({ success: false, message: `Note must be text up to ${MAX_STAGE_NOTE} characters.` });
    }

    const companyId = req.companyId;
    const status = stageToStatus(stage);
    // Only this company's application, and only if the stage really changes (no duplicate entries/emails).
    const application = await JobApplication.findOneAndUpdate(
      { _id: applicationId, companyId, stage: { $ne: stage } },
      {
        $set: { stage, status },
        $push: { stageHistory: { stage, note: note.trim(), at: new Date() } },
        $inc: { statusRevision: 1 },
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      const exists = await JobApplication.findOne({ _id: applicationId, companyId }).select("_id");
      if (!exists) return res.status(404).json({ success: false, message: "Application not found." });
      return res.status(200).json({ success: true, changed: false, emailSent: false, message: `Already at "${stageLabel(stage)}".` });
    }

    let emailSent = false;
    if (notifyCandidate) {
      try {
        const [candidate, job, company] = await Promise.all([
          ensureCandidateProfile(application.userId),
          Job.findById(application.jobId).select("title"),
          Company.findById(companyId).select("name email"),
        ]);
        if (!candidate?.email) throw new Error("Candidate's registered email is unavailable.");
        await sendStageUpdateEmail({
          candidateEmail: candidate.email, candidateName: candidate.name || "Candidate",
          jobTitle: job?.title || "Position", companyName: company?.name || "Company",
          companyEmail: company?.email, stageLabel: stageLabel(stage), note: note.trim(),
        });
        emailSent = true;
      } catch (error) {
        console.error("Stage update email failed:", error.code || error.message);
      }
    }

    return res.status(200).json({
      success: true,
      changed: true,
      emailSent,
      message: `Moved to "${stageLabel(stage)}".` + (notifyCandidate ? (emailSent ? " Candidate emailed." : " Email could not be sent; the stage was saved.") : ""),
      application,
    });
  } catch (error) {
    console.error("Change Application Stage Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Change application status & notify candidate via email
export const changeJobApplicationStatus = async (req, res) => {
  try {
    const targetAppId = req.params.applicationId || req.body.id;
    const normalized = typeof req.body.status === "string" ? req.body.status.trim().toLowerCase() : "";
    const statuses = { accepted: "Accepted", rejected: "Rejected", pending: "Pending" };
    const status = Object.hasOwn(statuses, normalized) ? statuses[normalized] : null;
    if (!mongoose.isValidObjectId(targetAppId) || !status) {
      return res.status(400).json({ success: false, message: "Provide a valid application ID and status (Accepted, Rejected, or Pending)." });
    }
    const companyId = req.companyId;

    const existing = await JobApplication.findById(targetAppId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const appCompanyId = existing.companyId;
    if (appCompanyId.toString() !== companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this application",
      });
    }

    const notify = normalized === "accepted" || normalized === "rejected";
    const details = {};
    for (const field of ["interviewDate", "interviewTime", "interviewType", "interviewLink", "interviewLocation", "notes", "rejectionReason"]) {
      if (req.body[field] !== undefined && (typeof req.body[field] !== "string" || req.body[field].length > 2000)) {
        return res.status(400).json({ success: false, message: `Invalid ${field}.` });
      }
    }
    if (normalized === "accepted" && req.body.interviewDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.interviewDate) || Number.isNaN(Date.parse(req.body.interviewDate))) {
        return res.status(400).json({ success: false, message: "Invalid interview date." });
      }
      details.interviewDetails = {
        date: req.body.interviewDate, time: req.body.interviewTime || "",
        type: req.body.interviewType || "", link: req.body.interviewLink || "",
        location: req.body.interviewLocation || "", notes: req.body.notes || "",
      };
    }
    if (normalized === "rejected" && req.body.rejectionReason) details.feedback = req.body.rejectionReason;
    // Atomic transition: concurrent clicks/retries for the same status have one winner.
    const application = await JobApplication.findOneAndUpdate({
      _id: targetAppId, companyId,
      $expr: { $ne: [{ $toLower: { $ifNull: ["$status", "pending"] } }, normalized] },
    }, {
      $set: { status, stage: statusToStage(status), ...details, statusNotification: { state: notify ? "sending" : "not_required", updatedAt: new Date() } },
      // Timeline entry the candidate sees in their progress tracker.
      $push: { stageHistory: { stage: statusToStage(status), note: stageNoteFor(normalized, details), at: new Date() } },
      $inc: { statusRevision: 1 },
    }, { new: true, runValidators: true });
    if (!application) {
      return res.status(200).json({ success: true, changed: false, emailSent: false,
        message: "Application status is unchanged. No additional email was sent." });
    }
    let emailSent = false;
    if (notify) {
      try {
        const [candidate, job, company] = await Promise.all([
          ensureCandidateProfile(application.userId),
          Job.findById(application.jobId).select("title"),
          Company.findById(application.companyId).select("name email"),
        ]);
        if (!candidate?.email) throw new Error("Candidate's registered email is unavailable.");
        await sendApplicationStatusEmail({
          candidateEmail: candidate.email, candidateName: candidate.name || "Candidate",
          jobTitle: job?.title || "Position", companyName: company?.name || "Company",
          companyEmail: company?.email, status,
          interviewDetails: details.interviewDetails, feedback: details.feedback,
        });
        emailSent = true;
      } catch (error) {
        console.error("Application status notification failed:", error.code || error.name);
      }
      application.statusNotification = { state: emailSent ? "sent" : "failed", updatedAt: new Date() };
      try {
        await JobApplication.updateOne({ _id: targetAppId, statusRevision: application.statusRevision }, {
          $set: { statusNotification: application.statusNotification },
        });
      } catch (error) {
        console.error("Could not record notification outcome:", error.code || error.name);
      }
    }

    return res.status(200).json({
      success: true,
      changed: true,
      emailSent,
      message: `Application marked as ${status}.` + (notify
        ? emailSent ? " Notification email sent." : " Notification email could not be sent; the status was saved."
        : ""),
      application,
    });

  } catch (error) {
    console.error("Change Job Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Change job visibility (active/inactive)
export const changeVisibility = async (req, res) => {
  try {
    // Get job ID from request body
    const { id } = req.body;

    // Get logged-in company ID from protectCompany middleware
    const companyId = req.companyId;

    // Find the job using job ID and company ID
    // This ensures the job belongs to the logged-in company
    const job = await Job.findOne({
      _id: id,
      companyId: companyId,
    });

    // If job does not exist or does not belong to this company
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not authorized",
      });
    }

    // Change the visibility status
    if(companyId.toString() !== job.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to change the visibility of this job",
      });
    }
    job.visible = !job.visible;

    // Save the updated job
    await job.save();

    // Send updated job in response
    return res.status(200).json({
      success: true,
      message: "Job visibility changed successfully",
      job,
    });

  } catch (error) {
    console.error("Change Visibility Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
