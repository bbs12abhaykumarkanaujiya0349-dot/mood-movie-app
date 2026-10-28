const axios = require('axios');
const { SUPPORTED_MOODS, MOOD_GENRES } = require('../constants/moods');

/**
 * External AI Mood Classifier utilizing Google Gemini REST API.
 * Active ONLY when AI_API_KEY is present in the environment.
 */
const classifyMoodExternal = async (text) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null; // Signals fallback to local classifier
  }

  const model = process.env.AI_MODEL || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const prompt = `You are a sentiment and mood classification AI for a movie recommendation system.
Analyze the user's text and classify their current emotional state into EXACTLY ONE of the following 8 moods:
${SUPPORTED_MOODS.join(', ')}

Guidelines:
1. If the user mentions feeling one emotion but looking for contrasting content (e.g. "I feel low and want something uplifting"), their CURRENT feeling takes precedence ("Sad").
2. Respond with ONLY a raw JSON object (no markdown formatting, no backticks):
{"mood": "<One of the 8 moods>", "confidence": <number between 0.5 and 1.0>}

User Text: "${text}"`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const response = await axios.post(url, requestBody, {
    timeout: 6000,
    headers: { 'Content-Type': 'application/json' },
  });

  const candidates = response.data?.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('Gemini API returned no candidates.');
  }

  const rawText = candidates[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Empty response content from Gemini API.');
  }

  // Strip possible markdown fences if returned
  const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanedJson);

  // Validate that the returned mood is strictly one of the 8 supported moods
  const mood = parsed.mood;
  if (!SUPPORTED_MOODS.includes(mood)) {
    throw new Error(`Gemini returned unsupported mood: "${mood}".`);
  }

  const rawConfidence = Number(parsed.confidence) || 0.85;
  const confidence = Math.min(1.0, Math.max(0.5, Math.round(rawConfidence * 100) / 100));

  return {
    mood,
    confidence,
    matchedKeywords: [],
    method: 'ai',
    uncertain: false,
    genres: MOOD_GENRES[mood] || [],
  };
};

module.exports = {
  classifyMoodExternal,
};
