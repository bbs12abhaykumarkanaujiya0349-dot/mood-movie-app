const movieService = require('./movieService');
const { MOOD_GENRES, SUPPORTED_MOODS } = require('../constants/moods');
const { calculateHybridScore, computeMaxLogPop } = require('../recommendation/scoring');
const { buildRecommendationReason } = require('../recommendation/reasonBuilder');
const AppError = require('../utils/AppError');

/**
 * Normalizes user mood input into a supported mood category
 */
const normalizeMood = (mood) => {
  if (!mood || typeof mood !== 'string') return null;
  const clean = mood.trim().toLowerCase();
  return (
    SUPPORTED_MOODS.find((m) => m.toLowerCase() === clean) || null
  );
};

/**
 * Gathers candidate movies for a mood by querying movieService for each mapped genre + popular movies.
 * Reuses MongoDB cache via movieService so external API limits are protected.
 */
const getCandidatesForMood = async (targetGenres = []) => {
  const candidateMap = new Map();

  // 1. Fetch movies for each mapped genre (up to 12 per genre)
  for (const genre of targetGenres) {
    try {
      const searchRes = await movieService.searchMovies({ genre, limit: 12 });
      if (searchRes && Array.isArray(searchRes.results)) {
        for (const m of searchRes.results) {
          const id = m.externalId || (m._id && m._id.toString());
          if (id && !candidateMap.has(id)) {
            candidateMap.set(id, m);
          }
        }
      }
    } catch (err) {
      console.warn(`[RecommendationService] Error querying genre ${genre}:`, err.message);
    }
  }

  // 2. Fetch popular movies to ensure candidate diversity
  try {
    const popularRes = await movieService.getPopularMovies(1);
    if (popularRes && Array.isArray(popularRes.results)) {
      for (const m of popularRes.results) {
        const id = m.externalId || (m._id && m._id.toString());
        if (id && !candidateMap.has(id)) {
          candidateMap.set(id, m);
        }
      }
    }
  } catch (err) {
    console.warn('[RecommendationService] Error querying popular movies:', err.message);
  }

  return Array.from(candidateMap.values());
};

/**
 * Generate ranked recommendations for a mood.
 *
 * @param {Object} params
 * @param {string} params.mood - Mood name (e.g. 'Happy')
 * @param {Object} [params.user] - Authenticated user object for personalization
 * @param {number} [params.limit=12] - Number of recommendations (max 30)
 * @param {boolean|number} [params.refresh=false] - Reshuffle/variation flag
 * @param {Object[]} [params.candidates] - Optional pre-supplied candidate list (for tests)
 * @returns {Promise<{ mood: string, source: string, recommendations: Object[], total: number }>}
 */
const getRecommendations = async ({
  mood,
  user = null,
  limit = 12,
  refresh = false,
  candidates: providedCandidates = null,
} = {}) => {
  const normalizedMood = normalizeMood(mood);
  if (!normalizedMood) {
    throw new AppError(
      `Invalid mood "${mood}". Supported moods: ${SUPPORTED_MOODS.join(', ')}`,
      400
    );
  }

  const targetGenres = MOOD_GENRES[normalizedMood] || ['Drama'];

  // 1. Obtain candidates (use provided candidates for unit tests, or fetch from movieService)
  let candidates = providedCandidates;
  if (!Array.isArray(candidates)) {
    candidates = await getCandidatesForMood(targetGenres);
  }

  if (candidates.length === 0) {
    return {
      mood: normalizedMood,
      source: 'local',
      recommendations: [],
      total: 0,
      message: 'No candidate movies found for this mood.',
    };
  }

  // 2. Extract personalization context if user is authenticated
  const userPreferredGenres = user?.preferences?.favoriteGenres || [];
  const watchlistIds = (user?.watchlist || []).map((id) => (id._id ? id._id.toString() : id.toString()));
  const favoriteIds = (user?.favoriteMovies || []).map((id) => (id._id ? id._id.toString() : id.toString()));

  const maxLogPop = computeMaxLogPop(candidates);
  const detectedSource = candidates[0]?.source || 'omdb';

  // 3. Score all candidates using pure functional hybrid scoring
  const scored = candidates.map((movie) => {
    const movieGenres = Array.isArray(movie.genres) ? movie.genres : [];
    const normalizedTargets = targetGenres.map((g) => g.toLowerCase());
    const matchedGenres = movieGenres.filter((mg) =>
      normalizedTargets.some((tg) => mg.toLowerCase().includes(tg) || tg.includes(mg.toLowerCase()))
    );

    const scoreResult = calculateHybridScore(movie, {
      targetGenres,
      maxLogPop,
      userPreferredGenres,
      watchlistIds,
      favoriteIds,
    });

    const reason = buildRecommendationReason({
      movie,
      mood: normalizedMood,
      targetGenres,
      userPreferredGenres,
    });

    return {
      movie,
      title: movie.title,
      matchScore: scoreResult.matchScore,
      reason,
      matchedGenres,
      inWatchlist: scoreResult.inWatchlist,
      inFavorites: scoreResult.inFavorites,
    };
  });

  // 4. Sort descending by matchScore
  if (refresh) {
    // Add small randomized variation within high scorers so user discovers fresh titles
    scored.sort((a, b) => {
      const jitterA = a.matchScore + (Math.random() * 6 - 3);
      const jitterB = b.matchScore + (Math.random() * 6 - 3);
      return jitterB - jitterA;
    });
  } else {
    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (Number(b.movie.popularity) || 0) - (Number(a.movie.popularity) || 0);
    });
  }

  // 5. Paginate/clamp limit
  const cappedLimit = Math.min(30, Math.max(1, Number(limit) || 12));
  const topRecommendations = scored.slice(0, cappedLimit);

  return {
    mood: normalizedMood,
    source: detectedSource,
    recommendations: topRecommendations,
    total: scored.length,
  };
};

module.exports = {
  normalizeMood,
  getCandidatesForMood,
  getRecommendations,
  recommendForMood: getRecommendations,
  scoreMovieForMood: (movie, targetGenres) => {
    const res = calculateHybridScore(movie, { targetGenres });
    return {
      ...movie,
      matchScore: res.matchScore,
      matchedGenres: movie.genres?.filter((g) => targetGenres.includes(g)) || [],
      reason: buildRecommendationReason({ movie, targetGenres }),
    };
  },
};
