const { MOOD_GENRES, SUPPORTED_MOODS } = require('../constants/moods');
const AppError = require('../utils/AppError');

/**
 * Score a single candidate movie against a mood's target genres and metadata.
 * Works seamlessly across TMDb, OMDb (handling null ratings and empty fields), and local candidates.
 */
const scoreMovieForMood = (movie, targetGenres) => {
  if (!movie || typeof movie !== 'object') {
    return null;
  }

  const movieGenres = Array.isArray(movie.genres) ? movie.genres : [];
  const normalizedTargets = targetGenres.map((g) => g.toLowerCase());

  // Find overlapping genres (case-insensitive)
  const matchedGenres = movieGenres.filter((mg) => {
    const mgLower = String(mg).toLowerCase();
    return normalizedTargets.some((tg) => mgLower.includes(tg) || tg.includes(mgLower));
  });

  // 1. Genre Overlap Score (0 - 50 points)
  const genreRatio = targetGenres.length > 0 ? matchedGenres.length / targetGenres.length : 0;
  const genreScore = genreRatio * 50;

  // 2. Rating Score (0 - 50 points)
  // Safely handles OMDb null ratings without NaN
  const numericRating = typeof movie.rating === 'number' && !isNaN(movie.rating) ? movie.rating : 0;
  const ratingScore = (numericRating / 10) * 50;

  // Total Match Score capped between 10 and 99
  const baseScore = genreScore + ratingScore;
  const matchScore = Math.min(Math.max(Math.round(baseScore), matchedGenres.length > 0 ? 30 : 10), 99);

  let reason = 'Curated match based on emotional tone';
  if (matchedGenres.length > 0) {
    reason = `Matches ${matchedGenres.join(' & ')} mood genres`;
  }

  return {
    ...movie,
    matchScore,
    reason,
    matchedGenres,
  };
};

/**
 * Generate ranked movie recommendations for a given mood from candidate movies
 */
const recommendForMood = ({ mood, candidates = [], limit = 12 }) => {
  if (!mood || typeof mood !== 'string') {
    throw new AppError('Mood category must be provided as a string.', 400);
  }

  const cleanMood = mood.trim();
  const normalizedMood =
    SUPPORTED_MOODS.find((m) => m.toLowerCase() === cleanMood.toLowerCase()) || cleanMood;

  const targetGenres = MOOD_GENRES[normalizedMood] || ['Drama'];

  // Score all candidate movies
  const scored = candidates
    .map((m) => scoreMovieForMood(m, targetGenres))
    .filter(Boolean);

  // Sort by matchScore descending, then by popularity descending
  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (b.popularity || 0) - (a.popularity || 0);
  });

  const topResults = scored.slice(0, Math.max(1, limit));
  const detectedSource = (topResults[0] && topResults[0].source) || 'local';

  return {
    mood: normalizedMood,
    source: detectedSource,
    recommendations: topResults,
    total: scored.length,
  };
};

module.exports = {
  scoreMovieForMood,
  recommendForMood,
};
