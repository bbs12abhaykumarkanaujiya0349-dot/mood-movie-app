const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const MoodHistory = require('../models/MoodHistory');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getDateRange, fillDateBuckets, generateDateSeries } = require('../utils/dateBuckets');

/**
 * @desc   Get high-level summary telemetry for admin dashboard
 * @route  GET /api/admin/analytics/overview
 * @access Protected (Admin only)
 */
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

  const [
    totalUsers,
    totalMovies,
    totalReviews,
    totalRecommendations,
    activeUsers,
    popularMoodAgg,
  ] = await Promise.all([
    User.countDocuments(),
    Movie.countDocuments(),
    Review.countDocuments(),
    MoodHistory.countDocuments(),
    User.countDocuments({ lastActive: { $gte: sevenDaysAgo } }),
    MoodHistory.aggregate([
      { $group: { _id: '$detectedMood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  const popularMood = popularMoodAgg.length > 0 ? popularMoodAgg[0]._id : 'N/A';

  res.status(200).json({
    success: true,
    totalUsers,
    totalMovies,
    totalReviews,
    totalRecommendations,
    activeUsers,
    popularMood,
  });
});

/**
 * @desc   Get time-series and aggregated charts for 7d, 30d, 90d
 * @route  GET /api/admin/analytics/charts?range=7d|30d|90d
 * @access Protected (Admin only)
 */
const getAnalyticsCharts = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;

  if (!['7d', '30d', '90d'].includes(range)) {
    throw new AppError('Invalid range. Valid options are: 7d, 30d, 90d.', 400);
  }

  const { startDate, endDate } = getDateRange(range);

  // 1. User Growth (Daily registrations within range)
  const rawUserGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      },
    },
  ]);
  const userGrowth = fillDateBuckets(startDate, endDate, rawUserGrowth, { count: 0 });

  // 2. Mood Distribution
  const rawMoods = await MoodHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$detectedMood',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        mood: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
  const moodDistribution = rawMoods;

  // 3. Popular Genres (across all movies in catalog)
  const popularGenres = await Movie.aggregate([
    { $unwind: '$genres' },
    {
      $group: {
        _id: '$genres',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        genre: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // 4. Most Reviewed Movies
  const mostReviewedMovies = await Review.aggregate([
    {
      $group: {
        _id: '$movieId',
        reviewCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
    { $sort: { reviewCount: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movie',
      },
    },
    { $unwind: '$movie' },
    {
      $project: {
        _id: 0,
        title: '$movie.title',
        reviewCount: 1,
        averageRating: { $round: ['$averageRating', 1] },
      },
    },
  ]);

  // 5. User Activity (Daily Recommendations and Reviews)
  const [dailyRecs, dailyReviews] = await Promise.all([
    MoodHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const recMap = new Map(dailyRecs.map((d) => [d._id, d.count]));
  const revMap = new Map(dailyReviews.map((d) => [d._id, d.count]));
  const dateSeries = generateDateSeries(startDate, endDate);

  const userActivity = dateSeries.map((date) => ({
    date,
    recommendations: recMap.get(date) || 0,
    reviews: revMap.get(date) || 0,
  }));

  // 6. Sentiment Breakdown
  const rawSentiments = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$sentiment',
        count: { $sum: 1 },
      },
    },
  ]);
  const sentimentMap = new Map(rawSentiments.map((s) => [s._id, s.count]));
  const sentimentBreakdown = ['positive', 'neutral', 'negative'].map((sentiment) => ({
    sentiment,
    count: sentimentMap.get(sentiment) || 0,
  }));

  // 7. Top Rated Movies
  const topRatedMovies = await Movie.aggregate([
    {
      $match: {
        rating: { $ne: null },
      },
    },
    { $sort: { rating: -1, popularity: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movieId',
        as: 'reviews',
      },
    },
    {
      $project: {
        _id: 0,
        title: '$title',
        rating: 1,
        reviewCount: { $size: '$reviews' },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    range,
    userGrowth,
    moodDistribution,
    popularGenres,
    mostReviewedMovies,
    userActivity,
    sentimentBreakdown,
    topRatedMovies,
  });
});

module.exports = {
  getAnalyticsOverview,
  getAnalyticsCharts,
};
