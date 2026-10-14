const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { uploadCV } = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

// Public route: submit application with CV
router.post('/', uploadCV.single('cv'), applicationController.submitApplication);

// Protected HR routes
router.get('/', requireAuth, applicationController.getAllApplications);
router.get('/:id', requireAuth, applicationController.getApplicationById);
router.get('/:id/download-cv', requireAuth, applicationController.downloadCV);
router.patch('/:id/status', requireAuth, applicationController.updateApplicationStatus);
router.delete('/:id', requireAuth, applicationController.deleteApplication);

module.exports = router;

