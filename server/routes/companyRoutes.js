import express from "express";
import {
  registerCompany,
  loginCompany,
  getCompanyData,
  postJob,
  getCompanyPostedJobs,
  getCompanyJobApplicants,
  changeJobApplicationStatus,
  changeVisibility,
} from "../controllers/companyController.js";
import { generateJobDescription } from "../controllers/aiController.js";
import { protectCompany } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";
const router = express.Router();

// Company Authentication
router.post(
  "/register",
  upload.single("image"),
  registerCompany
);

router.post("/login", loginCompany);

// Company Profile
router.get("/company",protectCompany, getCompanyData);

// Jobs
router.post("/post-job",protectCompany, postJob);
router.post(
  "/generate-job-description",
  protectCompany,
  generateJobDescription
);
router.get("/applicants",protectCompany, getCompanyJobApplicants);
router.get("/list-jobs",protectCompany, getCompanyPostedJobs);
// router.get("/job-applicants/:jobId", getJobApplicants);

// Job Application Status Update
router.put("/change-status/:applicationId", protectCompany, changeJobApplicationStatus);
router.post("/change-status/:applicationId", protectCompany, changeJobApplicationStatus);
router.post("/change-status", protectCompany, changeJobApplicationStatus);


// Job Visibility
router.put("/change-visibility", protectCompany, changeVisibility);

export default router;