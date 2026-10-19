const { classifyMoodLocally } = require('./localMoodClassifier');
const { classifyMoodExternal } = require('./externalMoodClassifier');

/**
 * High-level Mood Classifier abstraction.
 * Tries external AI (Gemini) if AI_API_KEY is available;
 * transparently falls back to local rule-based classifier on any issue.
 *
 * @param {string} text - User's emotional input
 * @returns {Promise<{ mood: string, confidence: number, method: string, uncertain?: boolean, matchedKeywords: string[], genres: string[] }>}
 */
const classifyMood = async (text) => {
  const hasKey = process.env.AI_API_KEY && process.env.AI_API_KEY.trim() !== '';

  if (hasKey) {
    try {
      const aiResult = await classifyMoodExternal(text);
      if (aiResult) {
        return aiResult;
      }
    } catch (error) {
      console.warn(
        `[MoodClassifier] External AI classification failed (${error.message}). Falling back to rule-based engine.`
      );
    }
  }

  // Resilient rule-based local classifier fallback
  return classifyMoodLocally(text);
};

module.exports = {
  classifyMood,
};
