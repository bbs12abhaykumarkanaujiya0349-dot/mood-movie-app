import api from './api';
import { MOODS } from '../constants/moods';
import { MOCK_MOVIES } from '../data/movies';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Keyword lexicons for rule-based sentiment classifier fallback
const MOOD_LEXICONS = {
  happy: ['happy', 'joy', 'laugh', 'cheer', 'fun', 'smile', 'uplift', 'light', 'good', 'humor', 'comedy'],
  sad: ['sad', 'cry', 'tears', 'depressed', 'gloomy', 'low', 'down', 'lonely', 'heartbroken', 'melancholy', 'poignant'],
  romantic: ['love', 'romance', 'couple', 'date', 'kiss', 'passion', 'romantic', 'heart', 'affection', 'sweetheart'],
  angry: ['angry', 'mad', 'rage', 'revenge', 'furious', 'fight', 'action', 'destroy', 'annoyed', 'grudge'],
  excited: ['excited', 'hyped', 'thrill', 'sci-fi', 'fast', 'adrenaline', 'adventure', 'epic', 'wild', 'rush'],
  relaxed: ['calm', 'relax', 'peace', 'chill', 'soothing', 'gentle', 'sleep', 'quiet', 'cozy', 'rest', 'easy'],
  fearful: ['scared', 'fear', 'horror', 'creepy', 'spooky', 'dark', 'ghost', 'shock', 'jump', 'tension', 'dread'],
  motivated: ['inspire', 'motivate', 'ambition', 'work', 'grit', 'success', 'triumph', 'goal', 'gym', 'sports', 'legend']
};

export const moodService = {
  /**
   * Classify free-text natural language input into a supported mood category
   * MOCK: replace with real API in integration step -> return (await api.post('/mood/analyze', { text })).data;
   */
  async analyzeMoodText(text = '') {
    await delay(600);

    const cleanText = text.toLowerCase().trim();
    if (!cleanText) {
      throw new Error('Please enter text to analyze your mood.');
    }

    // Heuristic keyword matching
    let bestMoodId = 'happy';
    let highestScore = 0;

    for (const [moodId, keywords] of Object.entries(MOOD_LEXICONS)) {
      let score = 0;
      for (const word of keywords) {
        if (cleanText.includes(word)) {
          score += 1;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMoodId = moodId;
      }
    }

    // Default to 'relaxed' if generic words or no direct match, with realistic confidence
    const detectedMood = MOODS.find((m) => m.id === bestMoodId) || MOODS[0];
    const confidence = highestScore > 0 ? Math.min(0.75 + highestScore * 0.08, 0.98) : 0.82;

    return {
      moodId: detectedMood.id,
      label: detectedMood.label,
      confidence: parseFloat(confidence.toFixed(2)),
      inputText: text,
      mappedGenres: detectedMood.mappedGenres,
      rationale: `Matched ${highestScore > 0 ? highestScore : 1} affective emotional indicator(s) in your prompt.`
    };
  },

  /**
   * Generate ranked recommendations based on mood
   * MOCK: replace with real API in integration step -> return (await api.post('/recommendations', { moodId })).data;
   */
  async getRecommendations(moodId) {
    await delay(450);

    const moodObj = MOODS.find((m) => m.id === moodId) || MOODS[0];

    // Filter candidate movies by mapped genres
    const candidates = MOCK_MOVIES.map((movie) => {
      const matchingGenres = movie.genres.filter((g) =>
        moodObj.mappedGenres.includes(g)
      );

      // Score calculation: genre overlap weight + rating weight
      const genreScore = (matchingGenres.length / moodObj.mappedGenres.length) * 50;
      const ratingScore = (movie.rating / 10) * 50;
      const matchScore = Math.min(Math.round(genreScore + ratingScore), 99);

      let reason = 'Curated match based on emotional tone';
      if (matchingGenres.length > 0) {
        reason = `Matches ${matchingGenres.join(' & ')} mood genres`;
      }

      return {
        ...movie,
        matchScore,
        reason,
        matchedGenres: matchingGenres
      };
    });

    // Sort by matchScore descending
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    return {
      mood: moodObj,
      recommendations: candidates.slice(0, 12),
      total: candidates.length
    };
  }
};

export default moodService;
