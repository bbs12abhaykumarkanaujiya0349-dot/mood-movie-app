const Review = require('../models/Review');
const { resolveMovieDocument } = require('../utils/movieResolver');
const { analyzeSentiment } = require('../ai/sentimentAnalyzer');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc   Create user review for a movie
 * @route  POST /api/reviews
 * @access Protected
 */
const createReview = asyncHandler(async (req, res) => {
  const { movieId, rating, comment } = req.body;

  const movieDoc = await resolveMovieDocument(movieId);

  // Check duplicate review per user per movie
  const existingReview = await Review.findOne({
    userId: req.user._id,
    movieId: movieDoc._id,
  });

  if (existingReview) {
    return res.status(409).json({
      success: false,
      message: 'You have already reviewed this movie.',
    });
  }

  // Calculate sentiment from rating + keyword lexicon
  const sentiment = analyzeSentiment(rating, comment);

  const review = await Review.create({
    userId: req.user._id,
    movieId: movieDoc._id,
    rating: Number(rating),
    comment,
    sentiment,
    status: 'visible',
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully.',
    review,
  });
});

/**
 * @desc   Get public reviews and summary for a movie
 * @route  GET /api/reviews/:movieId
 * @access Public
 */
const getMovieReviews = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));

  const movieDoc = await resolveMovieDocument(movieId);

  // Calculate summary metrics for visible reviews
  const summaryAgg = await Review.aggregate([
    { $match: { movieId: movieDoc._id, status: 'visible' } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating =
    summaryAgg.length > 0 ? Math.round(summaryAgg[0].avgRating * 10) / 10 : 0;
  const reviewCount = summaryAgg.length > 0 ? summaryAgg[0].reviewCount : 0;
  const totalPages = Math.ceil(reviewCount / limit) || 1;
  const skip = (page - 1) * limit;

  // Query reviews selecting user name ONLY (never email)
  const reviews = await Review.find({ movieId: movieDoc._id, status: 'visible' })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    summary: {
      averageRating,
      reviewCount,
    },
    page,
    totalPages,
    totalResults: reviewCount,
    reviews,
  });
});

/**
 * @desc   Update review (owner only)
 * @route  PATCH /api/reviews/:id
 * @access Protected
 */
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  // Owner check
  if (review.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to edit this review.',
    });
  }

  if (req.body.rating !== undefined) {
    review.rating = Number(req.body.rating);
  }
  if (req.body.comment !== undefined) {
    review.comment = req.body.comment;
  }

  // Recompute sentiment on edit
  review.sentiment = analyzeSentiment(review.rating, review.comment);
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review updated successfully.',
    review,
  });
});

/**
 * @desc   Delete review (owner or admin only)
 * @route  DELETE /api/reviews/:id
 * @access Protected
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  const isOwner = review.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this review.',
    });
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
  });
});

/**
 * @desc   Get current user's submitted reviews
 * @route  GET /api/reviews/me/list
 * @access Protected
 */
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user._id })
    .populate('movieId', 'title posterUrl rating genres releaseDate externalMovieId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

module.exports = {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
  getMyReviews,
};
