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
router.get("/applicants",protectCompany, getCompanyJobApplicants);
router.get("/list-jobs",protectCompany, getCompanyPostedJobs);
// router.get("/job-applicants/:jobId", getJobApplicants);

// Job Application
router.put("/change-status/:applicationId", changeJobApplicationStatus);

// Job Visibility
router.put("/change-visibility", protectCompany, changeVisibility);

export default router;