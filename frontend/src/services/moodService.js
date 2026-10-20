import api from './api';
import { mapRecommendation } from '../utils/movieMapper';

export const moodService = {
  /**
   * Classify free-text emotional natural language input into a supported mood category
   * POST /api/mood/analyze
   */
  async analyzeMoodText(text = '') {
    const cleanText = typeof text === 'string' ? text.trim() : '';
    if (!cleanText) {
      throw new Error('Please enter text to analyze your mood.');
    }

    const response = await api.post('/mood/analyze', { text: cleanText });
    const data = response.data;

    return {
      moodId: (data.mood || 'happy').toLowerCase(),
      label: data.mood,
      confidence: typeof data.confidence === 'number' ? data.confidence : 0.85,
      method: data.method || 'rule-based',
      uncertain: Boolean(data.uncertain),
      inputText: text,
      mappedGenres: data.genres || [],
      matchedKeywords: data.matchedKeywords || [],
      rationale: `Detected ${data.mood} mood via ${data.method || 'rule-based'} sentiment analysis.`
    };
  },

  /**
   * Retrieve all supported mood categories and mapped genres from backend
   * GET /api/mood/list
   */
  async getMoodList() {
    const response = await api.get('/mood/list');
    const raw = response.data.moods;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      return Object.entries(raw).map(([key, val]) => ({
        id: key.toLowerCase(),
        label: val.label || key,
        description: val.description || '',
        genres: val.genres || []
      }));
    }
    return [];
  },

  /**
   * Generate hybrid recommendations based on mood category or emotional text
   * POST /api/recommendations
   */
  async getRecommendations(optionsOrMoodId) {
    let payload = {};

    if (typeof optionsOrMoodId === 'string') {
      const formattedMood =
        optionsOrMoodId.charAt(0).toUpperCase() +
        optionsOrMoodId.slice(1).toLowerCase();
      payload = { mood: formattedMood, limit: 12, refresh: false };
    } else if (typeof optionsOrMoodId === 'object' && optionsOrMoodId !== null) {
      const { mood, text, limit = 12, refresh = false } = optionsOrMoodId;

      if (mood) {
        payload.mood =
          typeof mood === 'string'
            ? mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase()
            : mood;
      }
      if (text && text.trim()) {
        payload.text = text.trim();
      }
      payload.limit = Number(limit) || 12;
      payload.refresh = Boolean(refresh);
    }

    const response = await api.post('/recommendations', payload);
    const data = response.data;

    const rawList = data.recommendations || [];
    const mappedRecs = rawList.map(mapRecommendation);

    return {
      mood: data.mood,
      confidence: typeof data.confidence === 'number' ? data.confidence : 1.0,
      method: data.method || 'rule-based',
      source: data.source || 'local',
      recommendations: mappedRecs,
      total: mappedRecs.length
    };
  }
};

export default moodService;
