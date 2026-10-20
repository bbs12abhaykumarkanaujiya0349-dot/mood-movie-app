const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc   List all reviews for admin moderation with search, filter, and pagination
 * @route  GET /api/admin/reviews
 * @access Protected (Admin only)
 */
const getAdminReviews = asyncHandler(async (req, res) => {
  const { search, sentiment, status, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search && search.trim() !== '') {
    query.comment = { $regex: search.trim(), $options: 'i' };
  }

  if (sentiment && ['positive', 'neutral', 'negative'].includes(sentiment.toLowerCase())) {
    query.sentiment = sentiment.toLowerCase();
  }

  if (status && ['visible', 'hidden'].includes(status.toLowerCase())) {
    query.status = status.toLowerCase();
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [total, reviews] = await Promise.all([
    Review.countDocuments(query),
    Review.find(query)
      .populate('userId', 'name email')
      .populate('movieId', 'title externalMovieId posterUrl rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    reviews,
  });
});

/**
 * @desc   Update review moderation status (visible | hidden)
 * @route  PATCH /api/admin/reviews/:id/status
 * @access Protected (Admin only)
 */
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !['visible', 'hidden'].includes(status.toLowerCase())) {
    throw new AppError('Status must be either "visible" or "hidden".', 400);
  }

  const review = await Review.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('movieId', 'title');

  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  review.status = status.toLowerCase();
  await review.save();

  res.status(200).json({
    success: true,
    message: `Review status updated to "${review.status}".`,
    review,
  });
});

/**
 * @desc   Permanently delete a review by ID
 * @route  DELETE /api/admin/reviews/:id
 * @access Protected (Admin only)
 */
const deleteAdminReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
  });
});

module.exports = {
  getAdminReviews,
  updateReviewStatus,
  deleteAdminReview,
};
