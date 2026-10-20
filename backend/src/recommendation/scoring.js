/**
 * Rule-Based Hybrid Movie Recommendation Scoring
 * Computes transparent, explainable match scores (0-100) using weighted linear combination.
 * NOTE: This is an explainable rule-based scoring algorithm, not machine learning.
 */

const SCORING_WEIGHTS = {
  moodGenreMatch: 45,
  rating: 25,
  popularity: 15,
  userPreference: 15,
};

const DEFAULT_NEUTRAL_RATING = 6.5; // Neutral rating out of 10 for unrated/missing movies

/**
 * Calculates position-weighted mood genre match score (0 to 1).
 * Earlier mapped genres receive higher importance (e.g. primary genre has highest weight).
 */
const calculateMoodGenreScore = (movieGenres = [], targetGenres = []) => {
  if (!Array.isArray(targetGenres) || targetGenres.length === 0) return 0;
  if (!Array.isArray(movieGenres) || movieGenres.length === 0) return 0;

  const normalizedMovieGenres = movieGenres.map((g) => String(g).trim().toLowerCase());
  const N = targetGenres.length;

  let totalWeight = 0;
  let matchedWeight = 0;

  for (let i = 0; i < N; i++) {
    const target = String(targetGenres[i]).trim().toLowerCase();
    // Position weight: first genre gets weight N, next N-0.5, etc.
    const weight = Math.max(1, N - i * 0.5);
    totalWeight += weight;

    const isMatch = normalizedMovieGenres.some(
      (mg) => mg === target || mg.includes(target) || target.includes(mg)
    );
    if (isMatch) {
      matchedWeight += weight;
    }
  }

  return totalWeight > 0 ? matchedWeight / totalWeight : 0;
};

/**
 * Calculates normalized rating score (0 to 1).
 * Missing/null ratings get a neutral default instead of zero.
 */
const calculateRatingScore = (rating, neutralRating = DEFAULT_NEUTRAL_RATING) => {
  if (typeof rating === 'number' && !isNaN(rating) && Number.isFinite(rating)) {
    return Math.min(1, Math.max(0, rating / 10));
  }
  return Math.min(1, Math.max(0, neutralRating / 10));
};

/**
 * Computes maximum log10 popularity over a candidate set.
 */
const computeMaxLogPop = (candidates = []) => {
  let maxLog = 1;
  for (const c of candidates) {
    const pop = Number(c.popularity) || 0;
    if (pop > 0) {
      const log = Math.log10(1 + pop);
      if (log > maxLog) maxLog = log;
    }
  }
  return maxLog;
};

/**
 * Calculates log-scaled popularity score (0 to 1).
 */
const calculatePopularityScore = (popularity, maxLogPop = 1) => {
  const pop = Number(popularity) || 0;
  if (pop <= 0 || maxLogPop <= 0) return 0;
  const logVal = Math.log10(1 + pop);
  return Math.min(1, Math.max(0, logVal / maxLogPop));
};

/**
 * Calculates user preference overlap score (0 to 1).
 * Compares movie genres with user's favorite genres / preferences.
 */
const calculateUserPrefScore = (movieGenres = [], userPreferredGenres = []) => {
  if (!Array.isArray(userPreferredGenres) || userPreferredGenres.length === 0) return 0;
  if (!Array.isArray(movieGenres) || movieGenres.length === 0) return 0;

  const normalizedPrefs = userPreferredGenres.map((g) => String(g).trim().toLowerCase());
  const normalizedMovieGenres = movieGenres.map((g) => String(g).trim().toLowerCase());

  let matches = 0;
  for (const pref of normalizedPrefs) {
    if (normalizedMovieGenres.some((mg) => mg === pref || mg.includes(pref) || pref.includes(mg))) {
      matches++;
    }
  }

  return Math.min(1, matches / normalizedPrefs.length);
};

/**
 * Computes the overall hybrid score (0-100) for a candidate movie.
 *
 * @param {Object} movie - Candidate movie object
 * @param {Object} context
 * @param {string[]} context.targetGenres - Mood mapped genres
 * @param {number} [context.maxLogPop=1] - Precomputed max log popularity
 * @param {string[]} [context.userPreferredGenres=[]] - User's favorite genres
 * @param {Set|string[]} [context.watchlistIds] - IDs of movies in user's watchlist
 * @param {Set|string[]} [context.favoriteIds] - IDs of movies in user's favorites
 * @param {Object} [context.weights] - Optional custom weights config
 * @param {Object} [context.options] - Optional flags (excludeSaved, etc.)
 * @returns {{ matchScore: number, componentScores: Object, inWatchlist: boolean, inFavorites: boolean }}
 */
const calculateHybridScore = (movie, context = {}) => {
  if (!movie || typeof movie !== 'object') {
    return { matchScore: 0, componentScores: {}, inWatchlist: false, inFavorites: false };
  }

  const weights = { ...SCORING_WEIGHTS, ...(context.weights || {}) };
  const targetGenres = context.targetGenres || [];
  const maxLogPop = context.maxLogPop || 1;
  const userPreferredGenres = context.userPreferredGenres || [];
  const options = context.options || {};

  const movieGenres = Array.isArray(movie.genres) ? movie.genres : [];

  // 1. Component calculations
  const moodGenreRatio = calculateMoodGenreScore(movieGenres, targetGenres);
  const ratingRatio = calculateRatingScore(movie.rating);
  const popularityRatio = calculatePopularityScore(movie.popularity, maxLogPop);
  const userPrefRatio = calculateUserPrefScore(movieGenres, userPreferredGenres);

  const moodGenrePoints = moodGenreRatio * weights.moodGenreMatch;
  const ratingPoints = ratingRatio * weights.rating;
  const popularityPoints = popularityRatio * weights.popularity;
  const userPrefPoints = userPrefRatio * weights.userPreference;

  let rawTotal = moodGenrePoints + ratingPoints + popularityPoints + userPrefPoints;

  // Check saved status
  const movieIdStr = String(movie.externalId || movie._id || '');
  const watchlistSet = new Set(
    Array.isArray(context.watchlistIds)
      ? context.watchlistIds.map(String)
      : context.watchlistIds instanceof Set
      ? Array.from(context.watchlistIds).map(String)
      : []
  );
  const favoritesSet = new Set(
    Array.isArray(context.favoriteIds)
      ? context.favoriteIds.map(String)
      : context.favoriteIds instanceof Set
      ? Array.from(context.favoriteIds).map(String)
      : []
  );

  const inWatchlist = watchlistSet.has(movieIdStr);
  const inFavorites = favoritesSet.has(movieIdStr);

  // Optional exclusion or slight penalty
  if (options.excludeSaved && (inWatchlist || inFavorites)) {
    return {
      matchScore: 0,
      componentScores: { moodGenrePoints, ratingPoints, popularityPoints, userPrefPoints },
      inWatchlist,
      inFavorites,
      excluded: true,
    };
  }

  if (inWatchlist || inFavorites) {
    // Slight penalty (5 points) so user gets fresh discoveries prioritized
    rawTotal = Math.max(10, rawTotal - 5);
  }

  const matchScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  return {
    matchScore,
    componentScores: {
      moodGenreMatch: Math.round(moodGenrePoints * 10) / 10,
      rating: Math.round(ratingPoints * 10) / 10,
      popularity: Math.round(popularityPoints * 10) / 10,
      userPreference: Math.round(userPrefPoints * 10) / 10,
    },
    inWatchlist,
    inFavorites,
  };
};

module.exports = {
  SCORING_WEIGHTS,
  DEFAULT_NEUTRAL_RATING,
  calculateMoodGenreScore,
  calculateRatingScore,
  computeMaxLogPop,
  calculatePopularityScore,
  calculateUserPrefScore,
  calculateHybridScore,
};
