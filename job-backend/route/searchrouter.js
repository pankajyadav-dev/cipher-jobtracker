const express = require('express');
const router = express.Router();
const searchController = require('../controller/searchcontroller');
const { authMiddleware } = require('../middleware/authmiddleware');

router.get('/jobs', searchController.searchJobs);
router.get('/suggestions', searchController.getSearchSuggestions);
router.get('/filters', searchController.getSearchFilters);
router.post('/save', authMiddleware, searchController.saveSearch);

module.exports = router;
