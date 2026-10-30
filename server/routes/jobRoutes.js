// import express from 'express';
// import { getJobs, getJobById, matchJobWithResume, analyzeATS } from '../controllers/jobController.js';
// import { optimizeResumeForJob } from '../controllers/aiController.js';

// const router = express.Router();

// // route to get all jobs data
// router.get('/', getJobs);

// // route to match candidate resume with job description
// router.post('/match', matchJobWithResume);

// // route for ATS Resume Simulator analysis
// router.post('/ats-analyze', analyzeATS);

// // route for AI ATS Optimization suggestions
// router.post('/ats-optimize', optimizeResumeForJob);

// // route to get single job by id
// router.get('/:id', getJobById);

// export default router;



// import express from "express";

// import {
//   getJobs,
//   getJobById,
//   matchJobWithResume,
//   analyzeATS,
// } from "../controllers/jobController.js";

// import {
//   optimizeResumeForJob,
//   generateResumeFromATS,
// } from "../controllers/aiController.js";

// const router = express.Router();

// // Get all jobs
// router.get("/", getJobs);

// // Match resume with jobs
// router.post("/match", matchJobWithResume);

// // ATS resume analysis
// router.post("/ats-analyze", analyzeATS);

// // Get ATS optimization suggestions
// router.post("/ats-optimize", optimizeResumeForJob);

// // Generate a complete improved resume
// router.post("/ats-generate-resume", generateResumeFromATS);

// // Get a single job by ID
// router.get("/:id", getJobById);

// export default router;



import express from 'express';
import {
  getJobs,
  getJobById,
  matchJobWithResume,
  analyzeATS,
} from '../controllers/jobController.js';

import {
  optimizeResumeForJob,
  generateImprovedResume,
} from '../controllers/aiController.js';

const router = express.Router();

// Get all jobs
router.get('/', getJobs);

// Match resume with a job
router.post('/match', matchJobWithResume);

// ATS resume analysis
router.post('/ats-analyze', analyzeATS);

// AI resume optimization suggestions
router.post('/ats-optimize', optimizeResumeForJob);

// Generate a complete improved resume
router.post('/ats-generate-resume', generateImprovedResume);

// Get a single job by ID
router.get('/:id', getJobById);

export default router;