const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public routes (for careers.html)
router.get('/', jobController.getPublicJobs);
router.get('/:id', jobController.getJobById);

// Protected HR routes
router.get('/admin/all', requireAuth, jobController.getAllJobsAdmin);
router.post('/', requireAuth, jobController.createJob);
router.put('/:id', requireAuth, jobController.updateJob);
router.delete('/:id', requireAuth, jobController.deleteJob);

module.exports = router;

