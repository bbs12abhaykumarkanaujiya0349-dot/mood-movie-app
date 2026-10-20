/**
 * Explainable Recommendation Reason Builder
 * Generates transparent, human-readable explanations strictly reflecting true movie metadata.
 * Never hallucinate genres, ratings, or facts not present on the movie.
 */

const formatGenreList = (genres = []) => {
  if (!Array.isArray(genres) || genres.length === 0) return '';
  if (genres.length === 1) return genres[0];
  if (genres.length === 2) return `${genres[0]} and ${genres[1]}`;
  return `${genres.slice(0, -1).join(', ')} and ${genres[genres.length - 1]}`;
};

/**
 * Builds a factual, explainable reason for recommending a movie for a given mood.
 *
 * @param {Object} params
 * @param {Object} params.movie - Candidate movie object
 * @param {string} params.mood - Current mood label (e.g. 'Happy')
 * @param {string[]} [params.targetGenres=[]] - Mood mapped genres
 * @param {string[]} [params.userPreferredGenres=[]] - User's favorite genres
 * @returns {string} Human-readable reason
 */
const buildRecommendationReason = ({
  movie,
  mood = 'Relaxed',
  targetGenres = [],
  userPreferredGenres = [],
} = {}) => {
  if (!movie || typeof movie !== 'object') {
    return `Curated for your ${mood} mood.`;
  }

  const movieGenres = Array.isArray(movie.genres) ? movie.genres : [];
  const normalizedTargets = targetGenres.map((g) => String(g).trim().toLowerCase());

  // Strictly identify genres present on this movie that match mood target genres
  const matchedMoodGenres = movieGenres.filter((mg) => {
    const mgLower = String(mg).trim().toLowerCase();
    return normalizedTargets.some((tg) => mgLower === tg || mgLower.includes(tg) || tg.includes(mgLower));
  });

  // Check if any genres match user's personal favorites
  const normalizedUserPrefs = userPreferredGenres.map((g) => String(g).trim().toLowerCase());
  const matchedUserGenres = movieGenres.filter((mg) => {
    const mgLower = String(mg).trim().toLowerCase();
    return normalizedUserPrefs.some((up) => mgLower === up || mgLower.includes(up) || up.includes(mgLower));
  });

  // Factual rating segment (only include if valid number)
  const hasValidRating =
    typeof movie.rating === 'number' && !isNaN(movie.rating) && movie.rating > 0;
  const ratingText = hasValidRating ? `, rated ${movie.rating}` : '';

  // Case 1: Direct mood genre overlap
  if (matchedMoodGenres.length > 0) {
    const genreStr = formatGenreList(matchedMoodGenres);
    let reason = `Matches ${genreStr}${ratingText}, because you're feeling ${mood}.`;

    if (matchedUserGenres.length > 0) {
      reason += ` Aligns with your favorite genres (${formatGenreList(matchedUserGenres)}).`;
    }
    return reason;
  }

  // Case 2: User preference overlap but no direct mood genre overlap
  if (matchedUserGenres.length > 0) {
    const userGenreStr = formatGenreList(matchedUserGenres);
    return `Matches your favorite genres (${userGenreStr})${ratingText}, curated to complement your ${mood} mood.`;
  }

  // Case 3: Popularity or emotional atmosphere fallback (no hallucinated genres)
  if (hasValidRating) {
    return `Highly rated (${movie.rating}/10), selected for an emotional atmosphere to match your ${mood} mood.`;
  }

  return `Selected for an emotional atmosphere to match your ${mood} mood.`;
};

module.exports = {
  formatGenreList,
  buildRecommendationReason,
};
