const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Review = require('../models/Review');
const MoodHistory = require('../models/MoodHistory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc   Get authenticated user statistics
 * @route  GET /api/users/me/stats
 * @access Protected
 */
const getMyStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const watchlistCount = Array.isArray(user.watchlist) ? user.watchlist.length : 0;
  const favoritesCount = Array.isArray(user.favoriteMovies) ? user.favoriteMovies.length : 0;
  const reviewCount = await Review.countDocuments({ userId: user._id });
  const moodCheckCount = await MoodHistory.countDocuments({ userId: user._id });
  const memberSince = user.createdAt;

  res.status(200).json({
    success: true,
    stats: {
      watchlistCount,
      favoritesCount,
      reviewCount,
      moodCheckCount,
      memberSince,
    },
  });
});

/**
 * @desc   Update authenticated user preferences (genres and language)
 * @route  PATCH /api/users/me/preferences
 * @access Protected
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const { favoriteGenres, language } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.preferences = user.preferences || {};

  if (favoriteGenres !== undefined) {
    if (!Array.isArray(favoriteGenres)) {
      throw new AppError('favoriteGenres must be an array of strings.', 400);
    }
    user.preferences.favoriteGenres = [
      ...new Set(favoriteGenres.map((g) => String(g).trim()).filter(Boolean)),
    ];
  }

  if (language !== undefined) {
    if (typeof language !== 'string' || language.trim() === '') {
      throw new AppError('language must be a non-empty string.', 400);
    }
    user.preferences.language = language.trim().toLowerCase();
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully.',
    preferences: user.preferences,
  });
});

/**
 * @desc   Permanently delete authenticated user account and cascade delete reviews and history
 * @route  DELETE /api/users/me
 * @access Protected
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required to confirm account deletion.', 400);
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Validate password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid password. Account deletion aborted.',
    });
  }

  // Cascade delete reviews and mood history
  await Review.deleteMany({ userId: user._id });
  await MoodHistory.deleteMany({ userId: user._id });
  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: 'Account and all associated reviews and history deleted successfully.',
  });
});

module.exports = {
  getMyStats,
  updatePreferences,
  deleteAccount,
};
