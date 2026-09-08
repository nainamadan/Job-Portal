import express from 'express'
import { getJobs } from '../controllers/jobController.js'
import { getJobById } from '../controllers/jobController.js'
const router = express.Router();
// route to get all jobs data
router.get('/', getJobs);
// route to get single job by id
router.get('/:id', getJobById);
export default router