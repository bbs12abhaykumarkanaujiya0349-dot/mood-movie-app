const recommendationService = require('../services/recommendationService');
const { classifyMood } = require('../ai/moodClassifier');
const MoodHistory = require('../models/MoodHistory');
const { resolveMovieDocument } = require('../utils/movieResolver');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc   Generate personalized, explainable recommendations for a mood or emotional text
 * @route  POST /api/recommendations
 * @access Public (Optional Auth: logs to MoodHistory and personalizes if token present)
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { mood, text, limit, refresh } = req.body;

  if ((!mood || String(mood).trim() === '') && (!text || String(text).trim() === '')) {
    throw new AppError('Either a mood category or natural-language emotional text must be provided.', 400);
  }

  let targetMood = mood;
  let confidence = 1.0;
  let method = 'manual';

  // 1. If text provided, analyze through mood classifier first
  if (text !== undefined && text !== null) {
    if (typeof text !== 'string' || text.trim() === '') {
      throw new AppError('Emotional text input cannot be empty.', 400);
    }
    const analysis = await classifyMood(text);
    targetMood = analysis.mood;
    confidence = analysis.confidence || 0.85;
    method = analysis.method || 'rule-based';
  }

  // 2. Generate hybrid recommendations
  const result = await recommendationService.getRecommendations({
    mood: targetMood,
    user: req.user || null,
    limit: limit ? Number(limit) : 12,
    refresh: Boolean(refresh),
  });

  // 3. If authenticated, record mood assessment in MoodHistory
  if (req.user) {
    try {
      const recommendationIds = [];
      for (const rec of result.recommendations) {
        try {
          const doc = await resolveMovieDocument(rec.movie.externalId || rec.movie._id);
          if (doc && doc._id) {
            recommendationIds.push(doc._id);
          }
        } catch {
          // Continue if any candidate ID resolution fails
        }
      }

      await MoodHistory.create({
        userId: req.user._id,
        inputText: text && String(text).trim() ? String(text).trim() : 'Selected manually',
        detectedMood: result.mood,
        confidence,
        recommendationIds,
      });
    } catch (historyErr) {
      console.warn('[RecommendationController] Failed to record MoodHistory:', historyErr.message);
    }
  }

  res.status(200).json({
    success: true,
    mood: result.mood,
    confidence,
    method,
    source: result.source,
    recommendations: result.recommendations,
  });
});

module.exports = {
  getRecommendations,
};
