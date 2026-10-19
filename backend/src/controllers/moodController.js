const { classifyMood } = require('../ai/moodClassifier');
const { MOOD_METADATA } = require('../constants/moods');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc   Analyze natural language text to classify user mood
 * @route  POST /api/mood/analyze
 * @access Public (Optional Auth)
 */
const analyze = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const result = await classifyMood(text);

  res.status(200).json({
    success: true,
    mood: result.mood,
    confidence: result.confidence,
    method: result.method,
    uncertain: result.uncertain || false,
    matchedKeywords: result.matchedKeywords || [],
    genres: result.genres || [],
  });
});

/**
 * @desc   Get list of all supported moods and their mapped genres
 * @route  GET /api/mood/list
 * @access Public
 */
const getMoodList = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    moods: MOOD_METADATA,
  });
});

module.exports = {
  analyze,
  getMoodList,
};
