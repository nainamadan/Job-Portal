import express from "express";
const router = express.Router();
import {
  getUserData,
  applyForJob,
  getUserJobApplications,
  updateUserResume,
  toggleSaveJob,
  getSavedJobs,
} from "../controllers/userController.js";
import upload from "../middleware/multer.js";

// get user data
router.get("/user", getUserData);

// apply for a job
router.post("/apply", applyForJob);

// get user applied applications
router.get("/applications", getUserJobApplications);

// update resume
router.post("/update-resume", upload.single('resume'), updateUserResume);

// toggle save job & get saved jobs
router.post("/toggle-save", toggleSaveJob);
router.get("/saved-jobs", getSavedJobs);

export default router;