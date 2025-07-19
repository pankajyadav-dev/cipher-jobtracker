const express = require('express');
const router = express.Router();
const profileController = require('../controller/profilecontroller');
const { authMiddleware } = require('../middleware/authmiddleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  }
});

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);
router.put('/change-password', authMiddleware, profileController.changePassword);
router.delete('/', authMiddleware, profileController.deleteAccount);
router.put('/profile-picture', authMiddleware, profileController.uploadProfilePicture);
router.post('/resume', authMiddleware, upload.single('resume'), profileController.uploadResume);
router.delete('/resume', authMiddleware, profileController.deleteResume);
router.get('/resume/download', authMiddleware, profileController.downloadResume);
router.get('/public/:userId', profileController.getPublicProfile);

module.exports = router;
