import express from 'express';
import { getJobs, getJobById, matchJobWithResume } from '../controllers/jobController.js';

const router = express.Router();

// route to get all jobs data
router.get('/', getJobs);

// route to match candidate resume with job description
router.post('/match', matchJobWithResume);

// route to get single job by id
router.get('/:id', getJobById);

export default router;