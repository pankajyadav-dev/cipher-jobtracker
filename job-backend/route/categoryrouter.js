const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categorycontroller');
const { authMiddleware, isAdmin } = require('../middleware/authmiddleware');

router.get('/', categoryController.getCategories);
router.get('/:categoryId', categoryController.getCategoryById);
router.post('/', authMiddleware, isAdmin, categoryController.createCategory);
router.put('/:categoryId', authMiddleware, isAdmin, categoryController.updateCategory);
router.delete('/:categoryId', authMiddleware, isAdmin, categoryController.deleteCategory);
router.put('/:categoryId/update-count', authMiddleware, isAdmin, categoryController.updateCategoryJobCount);

module.exports = router;
