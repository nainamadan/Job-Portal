import express from 'express';
import { getJobs, getJobById, matchJobWithResume, analyzeATS } from '../controllers/jobController.js';
import { optimizeResumeForJob } from '../controllers/aiController.js';

const router = express.Router();

// route to get all jobs data
router.get('/', getJobs);

// route to match candidate resume with job description
router.post('/match', matchJobWithResume);

// route for ATS Resume Simulator analysis
router.post('/ats-analyze', analyzeATS);

// route for AI ATS Optimization suggestions
router.post('/ats-optimize', optimizeResumeForJob);

// route to get single job by id
router.get('/:id', getJobById);

export default router;