/**
 * Normalizes movie data shapes received from the backend (OMDb, TMDb, or local MongoDB catalog)
 * to match the property contracts expected by UI components.
 */
export function mapMovie(movie) {
  if (!movie) return null;

  const id = movie.id || movie.externalMovieId || movie.externalId || (movie._id ? String(movie._id) : '');
  const posterUrl =
    !movie.posterUrl || movie.posterUrl === 'N/A' ? '' : movie.posterUrl;
  const backdropUrl =
    !movie.backdropUrl || movie.backdropUrl === 'N/A' ? '' : movie.backdropUrl;

  return {
    ...movie,
    id,
    externalId: movie.externalId || movie.externalMovieId || id,
    externalMovieId: movie.externalMovieId || movie.externalId || id,
    title: movie.title || 'Untitled',
    releaseDate: movie.releaseDate || '',
    genres: Array.isArray(movie.genres) ? movie.genres : [],
    overview: movie.overview || '',
    posterUrl,
    backdropUrl,
    rating:
      typeof movie.rating === 'number'
        ? movie.rating
        : parseFloat(movie.rating) || 0,
    runtime: movie.runtime || 0,
    language: movie.language || 'English',
    director: movie.director || '',
    cast: Array.isArray(movie.cast) ? movie.cast : [],
    source: movie.source || 'local'
  };
}

/**
 * Normalizes recommendation items returned by POST /api/recommendations.
 * Merges recommendation metadata (matchScore, reason, matchedGenres) with movie details.
 */
export function mapRecommendation(rec) {
  if (!rec) return null;

  const movieData = rec.movie ? rec.movie : rec;
  const mapped = mapMovie(movieData);

  return {
    ...mapped,
    matchScore:
      typeof rec.matchScore === 'number'
        ? rec.matchScore
        : typeof mapped.matchScore === 'number'
        ? mapped.matchScore
        : 80,
    reason:
      rec.reason ||
      mapped.reason ||
      'Curated match based on emotional tone and genre alignment',
    matchedGenres: rec.matchedGenres || mapped.genres || [],
    inWatchlist: Boolean(rec.inWatchlist),
    inFavorites: Boolean(rec.inFavorites)
  };
}
