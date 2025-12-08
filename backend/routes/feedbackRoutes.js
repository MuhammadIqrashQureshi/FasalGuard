const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  getFeedbackById,
  replyToFeedback,
  updateFeedbackStatus,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Protect all routes - only authenticated admins
router.use(protect);

// GET all feedback queries
router.get('/', getAllFeedback);

// GET single feedback by ID
router.get('/:id', getFeedbackById);

// POST reply to feedback
router.post('/:id/reply', replyToFeedback);

// PATCH update feedback status
router.patch('/:id/status', updateFeedbackStatus);

// DELETE feedback (optional)
router.delete('/:id', deleteFeedback);

module.exports = router;
