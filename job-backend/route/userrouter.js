const express = require('express');
const router = express.Router();
const userController = require('../controller/usercontroller');
const { authMiddleware } = require('../middleware/authmiddleware');

router.post('/signup', userController.addNewUser);
router.post('/login', userController.loginUser);
router.get('/logout', authMiddleware, userController.logoutUser);
router.get('/verify', authMiddleware, userController.verifyUser);
module.exports = router;
