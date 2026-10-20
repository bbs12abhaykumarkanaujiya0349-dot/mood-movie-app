const MoodHistory = require('../models/MoodHistory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc   Get authenticated user's mood and recommendation history
 * @route  GET /api/history
 * @access Protected
 */
const getHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const query = { userId: req.user._id };
  if (req.query.mood && String(req.query.mood).trim() !== '') {
    query.detectedMood = new RegExp(`^${req.query.mood.trim()}$`, 'i');
  }

  const totalResults = await MoodHistory.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limit) || 1;

  const history = await MoodHistory.find(query)
    .populate('recommendationIds', 'title posterUrl rating genres releaseDate externalMovieId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    totalPages,
    totalResults,
    history,
  });
});

/**
 * @desc   Delete single history entry
 * @route  DELETE /api/history/:id
 * @access Protected
 */
const deleteHistoryItem = asyncHandler(async (req, res) => {
  const item = await MoodHistory.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'History entry not found.',
    });
  }

  await MoodHistory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'History entry deleted successfully.',
  });
});

/**
 * @desc   Clear all history for current user
 * @route  DELETE /api/history
 * @access Protected
 */
const clearAllHistory = asyncHandler(async (req, res) => {
  const result = await MoodHistory.deleteMany({ userId: req.user._id });

  res.status(200).json({
    success: true,
    message: 'All mood history cleared successfully.',
    deletedCount: result.deletedCount,
  });
});

module.exports = {
  getHistory,
  deleteHistoryItem,
  clearAllHistory,
};
