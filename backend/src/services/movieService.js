const Movie = require('../models/Movie');
const localMovies = require('../data/localMovies');
const tmdbService = require('./tmdbService');
const AppError = require('../utils/AppError');

const isTmdbEnabled = () => {
  const key = process.env.MOVIE_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
};

/**
 * Filter, sort, and paginate the local dataset
 */
const searchLocalMovies = ({
  query = '',
  genre = '',
  year = '',
  minRating = 0,
  language = '',
  sort = 'popularity',
  page = 1,
  limit = 12,
}) => {
  let list = [...localMovies];

  // 1. Text Search Filter (Title, Overview, Cast, Director)
  if (query && query.trim() !== '') {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        (Array.isArray(m.cast) && m.cast.some((c) => c.toLowerCase().includes(q)))
    );
  }

  // 2. Genre Filter
  if (genre && genre.trim() !== '') {
    const g = genre.trim().toLowerCase();
    list = list.filter((m) =>
      m.genres.some((item) => item.toLowerCase() === g || item.toLowerCase().includes(g))
    );
  }

  // 3. Year Filter
  if (year && year.trim() !== '') {
    const y = year.trim();
    list = list.filter((m) => m.releaseDate && m.releaseDate.startsWith(y));
  }

  // 4. Min Rating Filter
  if (minRating && Number(minRating) > 0) {
    const min = Number(minRating);
    list = list.filter((m) => m.rating >= min);
  }

  // 5. Language Filter
  if (language && language.trim() !== '') {
    const lang = language.trim().toLowerCase();
    list = list.filter((m) => m.language.toLowerCase() === lang);
  }

  // 6. Sorting
  if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    list.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
  } else {
    // Default: popularity
    list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // 7. Pagination
  const totalResults = list.length;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 12);
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const offset = (pageNum - 1) * pageSize;
  const results = list.slice(offset, offset + pageSize);

  return {
    source: 'local',
    page: pageNum,
    totalPages,
    totalResults,
    results,
  };
};

/**
 * Upsert movie into MongoDB collection so it is cached
 */
const upsertMovieToDb = async (movie) => {
  if (!movie || !movie.externalId) return;
  try {
    await Movie.findOneAndUpdate(
      { externalMovieId: movie.externalId },
      {
        externalMovieId: movie.externalId,
        title: movie.title,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
        overview: movie.overview,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        rating: movie.rating,
        runtime: movie.runtime,
        language: movie.language,
        popularity: movie.popularity,
        cast: movie.cast,
        director: movie.director,
        trailerUrl: movie.trailerUrl,
        source: movie.source || 'local',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  } catch (err) {
    // Non-blocking log if DB upsert encounters an issue
    console.error(`Error caching movie ${movie.externalId} to MongoDB:`, err.message);
  }
};

/**
 * Search movies: Tries TMDb first; on failure falls back to local
 */
const searchMovies = async (params) => {
  if (isTmdbEnabled()) {
    try {
      const tmdbResult = await tmdbService.searchMovies({
        query: params.query,
        year: params.year,
        page: params.page,
      });

      // Filter TMDb results in-memory if genres/ratings requested
      let filtered = tmdbResult.results;
      if (params.genre) {
        const g = params.genre.toLowerCase();
        filtered = filtered.filter((m) =>
          m.genres.some((genreName) => genreName.toLowerCase().includes(g))
        );
      }
      if (params.minRating) {
        filtered = filtered.filter((m) => m.rating >= Number(params.minRating));
      }

      return {
        source: 'tmdb',
        page: tmdbResult.page,
        totalPages: tmdbResult.totalPages,
        totalResults: tmdbResult.totalResults,
        results: filtered.slice(0, Number(params.limit) || 12),
      };
    } catch (err) {
      console.warn(`[MovieService] TMDb search failed (${err.message}). Falling back to local data.`);
    }
  }

  return searchLocalMovies(params);
};

/**
 * Get Trending Movies
 */
const getTrendingMovies = async (page = 1) => {
  if (isTmdbEnabled()) {
    try {
      const data = await tmdbService.getTrending(page);
      return { source: 'tmdb', ...data };
    } catch (err) {
      console.warn(`[MovieService] TMDb trending failed (${err.message}). Falling back to local data.`);
    }
  }

  // Fallback to local trending (sorted by popularity)
  return searchLocalMovies({ sort: 'popularity', page, limit: 12 });
};

/**
 * Get Popular Movies
 */
const getPopularMovies = async (page = 1) => {
  if (isTmdbEnabled()) {
    try {
      const data = await tmdbService.getPopular(page);
      return { source: 'tmdb', ...data };
    } catch (err) {
      console.warn(`[MovieService] TMDb popular failed (${err.message}). Falling back to local data.`);
    }
  }

  // Fallback to local popular (sorted by rating & popularity)
  return searchLocalMovies({ sort: 'rating', page, limit: 12 });
};

/**
 * Get Genres
 */
const getMovieGenres = async () => {
  if (isTmdbEnabled()) {
    try {
      const genres = await tmdbService.getGenres();
      return { source: 'tmdb', genres };
    } catch (err) {
      console.warn(`[MovieService] TMDb genres failed (${err.message}). Falling back to local data.`);
    }
  }

  // Extract distinct genres from local dataset
  const genreSet = new Set();
  localMovies.forEach((m) => {
    (m.genres || []).forEach((g) => genreSet.add(g));
  });

  const genres = Array.from(genreSet).sort().map((name, idx) => ({
    id: idx + 1,
    name,
  }));

  return { source: 'local', genres };
};

/**
 * Get Movie Details by ID (TMDb numeric ID or local-X ID)
 */
const getMovieDetails = async (id) => {
  if (!id || String(id).trim() === '') {
    throw new AppError('A valid movie ID must be provided.', 400);
  }

  const cleanId = String(id).trim();

  // If ID starts with local- or is non-numeric, look in local dataset first
  if (cleanId.startsWith('local-')) {
    const movie = localMovies.find((m) => m.externalId === cleanId);
    if (!movie) {
      throw new AppError(`Movie with ID "${cleanId}" not found.`, 404);
    }
    await upsertMovieToDb(movie);
    return movie;
  }

  // Otherwise, try TMDb first if enabled
  if (isTmdbEnabled()) {
    try {
      const movie = await tmdbService.getDetails(cleanId);
      if (movie) {
        await upsertMovieToDb(movie);
        return movie;
      }
    } catch (err) {
      if (err.statusCode === 404) {
        throw err;
      }
      console.warn(`[MovieService] TMDb details failed (${err.message}). Checking local catalog.`);
    }
  }

  // Search local movies by externalId or index
  const localMatch = localMovies.find(
    (m) => m.externalId === cleanId || m.externalId === `local-${cleanId}`
  );
  if (localMatch) {
    await upsertMovieToDb(localMatch);
    return localMatch;
  }

  // Check MongoDB cache as secondary fallback
  const dbMatch = await Movie.findOne({
    $or: [{ externalMovieId: cleanId }, { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }],
  });
  if (dbMatch) {
    return {
      externalId: dbMatch.externalMovieId,
      title: dbMatch.title,
      releaseDate: dbMatch.releaseDate,
      genres: dbMatch.genres,
      overview: dbMatch.overview,
      posterUrl: dbMatch.posterUrl,
      backdropUrl: dbMatch.backdropUrl,
      rating: dbMatch.rating,
      runtime: dbMatch.runtime,
      language: dbMatch.language,
      popularity: dbMatch.popularity,
      cast: dbMatch.cast,
      director: dbMatch.director,
      trailerUrl: dbMatch.trailerUrl,
      source: dbMatch.source,
    };
  }

  throw new AppError(`Movie with ID "${cleanId}" not found.`, 404);
};

/**
 * Get Similar Movies
 */
const getSimilarMovies = async (id, page = 1) => {
  if (!id || String(id).trim() === '') {
    throw new AppError('A valid movie ID must be provided.', 400);
  }

  const cleanId = String(id).trim();

  if (isTmdbEnabled() && !cleanId.startsWith('local-')) {
    try {
      const data = await tmdbService.getSimilar(cleanId, page);
      return { source: 'tmdb', ...data };
    } catch (err) {
      console.warn(`[MovieService] TMDb similar failed (${err.message}). Falling back to local data.`);
    }
  }

  // Find reference movie to match genres
  let refMovie = localMovies.find((m) => m.externalId === cleanId);
  if (!refMovie) {
    refMovie = localMovies[0]; // Sensible fallback
  }

  const targetGenres = new Set(refMovie.genres || []);
  const similar = localMovies
    .filter((m) => m.externalId !== cleanId && m.genres.some((g) => targetGenres.has(g)))
    .sort((a, b) => b.rating - a.rating);

  const totalResults = similar.length;
  const pageSize = 12;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const offset = (Number(page) - 1) * pageSize;

  return {
    source: 'local',
    page: Number(page) || 1,
    totalPages,
    totalResults,
    results: similar.slice(offset, offset + pageSize),
  };
};

module.exports = {
  isTmdbEnabled,
  searchMovies,
  getTrendingMovies,
  getPopularMovies,
  getMovieGenres,
  getMovieDetails,
  getSimilarMovies,
};
