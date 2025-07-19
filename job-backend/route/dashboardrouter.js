const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardcontroller');
const { authMiddleware } = require('../middleware/authmiddleware');

router.get('/stats', authMiddleware, dashboardController.getDashboardStats);
router.get('/analytics/:jobId', authMiddleware, dashboardController.getJobAnalytics);

module.exports = router;
