const express = require('express');
const {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
  getMyReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const {
  validateCreateReview,
  validateUpdateReview,
} = require('../validators/reviewValidator');

const router = express.Router();

// Specific routes
router.get('/me/list', protect, getMyReviews);

// Base route for review creation
router.post('/', protect, validateCreateReview, createReview);

// Public movie reviews with summary
router.get('/:movieId', getMovieReviews);

// Update/Delete routes
router.patch('/:id', protect, validateUpdateReview, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
