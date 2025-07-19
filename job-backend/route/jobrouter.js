const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobcontroller');
const { authMiddleware, isAdmin, isUser } = require('../middleware/authmiddleware');

router.get('/user/my-jobs', authMiddleware, isAdmin, jobController.getUserJobs); 
router.get('/user/my-applications', authMiddleware, isUser, jobController.getUserApplications); 
router.get('/user/statistics', authMiddleware, jobController.getJobStatistics); 
router.get('/', jobController.getJobs);
router.get('/:jobId', jobController.getJobById);
router.post('/', authMiddleware, isAdmin, jobController.createJob); 
router.put('/:jobId', authMiddleware, isAdmin, jobController.updateJob); 
router.delete('/:jobId', authMiddleware, isAdmin, jobController.deleteJob); 
router.post('/:jobId/apply', authMiddleware, isUser, jobController.applyForJob); 
router.get('/:jobId/applications', authMiddleware, isAdmin, jobController.getJobApplications); 
router.put('/:jobId/applications/:applicationId/status', authMiddleware, isAdmin, jobController.updateApplicationStatus); 

module.exports = router;
