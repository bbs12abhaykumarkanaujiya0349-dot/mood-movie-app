const Movie = require('../models/Movie');
const localMovies = require('../data/localMovies');
const curatedMovies = require('../data/curatedImdbIds');
const tmdbService = require('./tmdbService');
const omdbService = require('./omdbService');
const cache = require('../utils/cache');
const AppError = require('../utils/AppError');

/**
 * Check if TMDb is configured and enabled
 */
const isTmdbEnabled = () => {
  const key = process.env.MOVIE_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
};

/**
 * Check if OMDb is configured, valid, and enabled
 */
const isOmdbEnabled = async () => {
  const key = process.env.OMDB_API_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return false;
  }
  return await omdbService.validateKey();
};

/**
 * Maps a MongoDB document into our unified movie shape
 */
const mapDbMovieToOurShape = (doc) => ({
  externalId: doc.externalMovieId,
  title: doc.title,
  releaseDate: doc.releaseDate || '',
  genres: doc.genres || [],
  overview: doc.overview || '',
  posterUrl: doc.posterUrl || '',
  backdropUrl: doc.backdropUrl || '',
  rating: doc.rating,
  runtime: doc.runtime,
  language: doc.language || 'en',
  popularity: doc.popularity || 0,
  cast: doc.cast || [],
  director: doc.director || '',
  trailerUrl: doc.trailerUrl || '',
  source: doc.source || 'omdb',
});

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
    list = list.filter((m) => m.rating !== null && m.rating >= min);
  }

  // 5. Language Filter
  if (language && language.trim() !== '') {
    const lang = language.trim().toLowerCase();
    list = list.filter((m) => m.language.toLowerCase() === lang);
  }

  // 6. Sorting
  if (sort === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
    console.error(`Error caching movie ${movie.externalId} to MongoDB:`, err.message);
  }
};

/**
 * Lazily hydrates curated movies with in-memory TTL and MongoDB cache reuse
 */
const getHydratedCuratedMovies = async () => {
  const active = await isOmdbEnabled();
  if (!active) {
    return localMovies;
  }

  const cacheKey = 'hydrated_curated_omdb_movies';
  const cached = cache.get(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const curatedIds = curatedMovies.map((m) => m.imdbId);

  try {
    // 1. Reuse MongoDB cache first to preserve daily API request quota
    const dbMovies = await Movie.find({ externalMovieId: { $in: curatedIds } });
    const dbMovieMap = new Map();
    dbMovies.forEach((doc) => {
      dbMovieMap.set(doc.externalMovieId, mapDbMovieToOurShape(doc));
    });

    const hydratedList = [];
    const missingIds = [];

    for (const item of curatedMovies) {
      if (dbMovieMap.has(item.imdbId)) {
        hydratedList.push(dbMovieMap.get(item.imdbId));
      } else {
        missingIds.push(item.imdbId);
      }
    }

    // 2. Hydrate only missing IDs through OMDb on demand (up to 10 at a time)
    if (missingIds.length > 0 && isOmdbEnabled()) {
      for (const id of missingIds.slice(0, 10)) {
        try {
          const movie = await omdbService.details(id);
          if (movie) {
            await upsertMovieToDb(movie);
            hydratedList.push(movie);
          }
        } catch (err) {
          console.warn(`[MovieService] Could not hydrate ${id}: ${err.message}`);
        }
      }
    }

    if (hydratedList.length > 0) {
      cache.set(cacheKey, hydratedList, 60 * 60 * 1000); // 1-hour in-memory cache
      return hydratedList;
    }
  } catch (err) {
    console.warn(`[MovieService] MongoDB query for curated movies failed: ${err.message}`);
  }

  // Fallback to local dataset
  return localMovies;
};

/**
 * Search movies: Tries TMDb first -> OMDb second -> Local dataset third
 */
const searchMovies = async (params = {}) => {
  // 1. Try TMDb first if MOVIE_API_KEY is configured
  if (isTmdbEnabled()) {
    try {
      const tmdbResult = await tmdbService.searchMovies({
        query: params.query,
        year: params.year,
        page: params.page,
      });

      let filtered = tmdbResult.results;
      if (params.genre) {
        const g = params.genre.toLowerCase();
        filtered = filtered.filter((m) =>
          m.genres.some((genreName) => genreName.toLowerCase().includes(g))
        );
      }
      if (params.minRating) {
        filtered = filtered.filter((m) => m.rating !== null && m.rating >= Number(params.minRating));
      }

      return {
        source: 'tmdb',
        page: tmdbResult.page,
        totalPages: tmdbResult.totalPages,
        totalResults: tmdbResult.totalResults,
        results: filtered.slice(0, Number(params.limit) || 12),
      };
    } catch (err) {
      console.warn(`[MovieService] TMDb search failed (${err.message}). Checking OMDb / local.`);
    }
  }

  // 2. Try OMDb second if OMDB_API_KEY is configured
  if (await isOmdbEnabled()) {
    try {
      if (params.query && String(params.query).trim() !== '') {
        // Title search via OMDb s=, then hydrate details for each result
        const searchResult = await omdbService.search({
          query: params.query,
          year: params.year,
          page: params.page,
        });

        const hydratedResults = [];
        for (const item of searchResult.results) {
          try {
            const movie = await getMovieDetails(item.imdbID);
            if (movie) hydratedResults.push(movie);
          } catch {
            // If details fails, map the basic search item
            hydratedResults.push(omdbService.mapOmdbMovieToOurShape(item));
          }
        }

        // In-memory filters on OMDb results
        let filtered = hydratedResults;
        if (params.genre) {
          const g = params.genre.toLowerCase();
          filtered = filtered.filter((m) =>
            m.genres.some((genreName) => genreName.toLowerCase().includes(g))
          );
        }
        if (params.minRating) {
          filtered = filtered.filter((m) => m.rating !== null && m.rating >= Number(params.minRating));
        }
        if (params.language) {
          const lang = params.language.toLowerCase();
          filtered = filtered.filter((m) => m.language.toLowerCase() === lang);
        }

        return {
          source: 'omdb',
          page: searchResult.page,
          totalPages: searchResult.totalPages,
          totalResults: searchResult.totalResults,
          results: filtered.slice(0, Number(params.limit) || 12),
        };
      }

      // If no text query is provided, compute search & filters from hydrated curated set
      const curated = await getHydratedCuratedMovies();
      let list = [...curated];

      if (params.genre) {
        const g = params.genre.toLowerCase();
        list = list.filter((m) =>
          m.genres.some((genreName) => genreName.toLowerCase().includes(g))
        );
      }
      if (params.year) {
        const y = String(params.year).trim();
        list = list.filter((m) => m.releaseDate && m.releaseDate.includes(y));
      }
      if (params.minRating) {
        list = list.filter((m) => m.rating !== null && m.rating >= Number(params.minRating));
      }
      if (params.language) {
        const lang = params.language.toLowerCase();
        list = list.filter((m) => m.language.toLowerCase() === lang);
      }

      // Sorting
      if (params.sort === 'rating') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (params.sort === 'newest') {
        list.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
      } else {
        list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      }

      const totalResults = list.length;
      const pageNum = Math.max(1, Number(params.page) || 1);
      const pageSize = Math.max(1, Number(params.limit) || 12);
      const totalPages = Math.ceil(totalResults / pageSize) || 1;
      const offset = (pageNum - 1) * pageSize;

      return {
        source: 'omdb',
        page: pageNum,
        totalPages,
        totalResults,
        results: list.slice(offset, offset + pageSize),
      };
    } catch (err) {
      console.warn(`[MovieService] OMDb search failed (${err.message}). Falling back to local data.`);
    }
  }

  // 3. Fallback to local dataset
  return searchLocalMovies(params);
};

/**
 * Get Trending Movies: TMDb -> OMDb (from curated set) -> Local
 */
const getTrendingMovies = async (page = 1) => {
  if (isTmdbEnabled()) {
    try {
      const data = await tmdbService.getTrending(page);
      return { source: 'tmdb', ...data };
    } catch (err) {
      console.warn(`[MovieService] TMDb trending failed (${err.message}). Checking OMDb / local.`);
    }
  }

  if (await isOmdbEnabled()) {
    try {
      const curated = await getHydratedCuratedMovies();
      const sorted = [...curated].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      const pageSize = 12;
      const pageNum = Math.max(1, Number(page) || 1);
      const totalResults = sorted.length;
      const totalPages = Math.ceil(totalResults / pageSize) || 1;
      const offset = (pageNum - 1) * pageSize;

      return {
        source: 'omdb',
        page: pageNum,
        totalPages,
        totalResults,
        results: sorted.slice(offset, offset + pageSize),
      };
    } catch (err) {
      console.warn(`[MovieService] OMDb trending failed (${err.message}). Falling back to local data.`);
    }
  }

  return searchLocalMovies({ sort: 'popularity', page, limit: 12 });
};

/**
 * Get Popular Movies: TMDb -> OMDb (from curated set) -> Local
 */
const getPopularMovies = async (page = 1) => {
  if (isTmdbEnabled()) {
    try {
      const data = await tmdbService.getPopular(page);
      return { source: 'tmdb', ...data };
    } catch (err) {
      console.warn(`[MovieService] TMDb popular failed (${err.message}). Checking OMDb / local.`);
    }
  }

  if (await isOmdbEnabled()) {
    try {
      const curated = await getHydratedCuratedMovies();
      const sorted = [...curated].sort((a, b) => {
        const ratingA = typeof a.rating === 'number' ? a.rating : 0;
        const ratingB = typeof b.rating === 'number' ? b.rating : 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.popularity || 0) - (a.popularity || 0);
      });
      const pageSize = 12;
      const pageNum = Math.max(1, Number(page) || 1);
      const totalResults = sorted.length;
      const totalPages = Math.ceil(totalResults / pageSize) || 1;
      const offset = (pageNum - 1) * pageSize;

      return {
        source: 'omdb',
        page: pageNum,
        totalPages,
        totalResults,
        results: sorted.slice(offset, offset + pageSize),
      };
    } catch (err) {
      console.warn(`[MovieService] OMDb popular failed (${err.message}). Falling back to local data.`);
    }
  }

  return searchLocalMovies({ sort: 'rating', page, limit: 12 });
};

/**
 * Get Genres: TMDb -> OMDb (from curated set) -> Local
 */
const getMovieGenres = async () => {
  if (isTmdbEnabled()) {
    try {
      const genres = await tmdbService.getGenres();
      return { source: 'tmdb', genres };
    } catch (err) {
      console.warn(`[MovieService] TMDb genres failed (${err.message}). Checking OMDb / local.`);
    }
  }

  if (await isOmdbEnabled()) {
    try {
      const curated = await getHydratedCuratedMovies();
      const genreSet = new Set();
      curated.forEach((m) => {
        (m.genres || []).forEach((g) => genreSet.add(g));
      });

      const genres = Array.from(genreSet)
        .sort()
        .map((name, idx) => ({
          id: idx + 1,
          name,
        }));

      return { source: 'omdb', genres };
    } catch (err) {
      console.warn(`[MovieService] OMDb genres failed (${err.message}). Falling back to local data.`);
    }
  }

  const genreSet = new Set();
  localMovies.forEach((m) => {
    (m.genres || []).forEach((g) => genreSet.add(g));
  });

  const genres = Array.from(genreSet)
    .sort()
    .map((name, idx) => ({
      id: idx + 1,
      name,
    }));

  return { source: 'local', genres };
};

/**
 * Get Movie Details by ID (TMDb numeric ID, IMDb tt ID, or local-X ID)
 */
const getMovieDetails = async (id) => {
  if (!id || String(id).trim() === '') {
    throw new AppError('A valid movie ID must be provided.', 400);
  }

  const cleanId = String(id).trim();

  // 1. If ID starts with local-, check local catalog first
  if (cleanId.startsWith('local-')) {
    const movie = localMovies.find((m) => m.externalId === cleanId);
    if (!movie) {
      throw new AppError(`Movie with ID "${cleanId}" not found.`, 404);
    }
    await upsertMovieToDb(movie);
    return movie;
  }

  // 2. Try TMDb first if enabled and ID is numeric
  if (isTmdbEnabled() && /^\d+$/.test(cleanId)) {
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
      console.warn(`[MovieService] TMDb details failed (${err.message}). Checking OMDb / local.`);
    }
  }

  // 3. Try OMDb if enabled
  if (await isOmdbEnabled()) {
    try {
      // Check in-memory cache
      const memCached = cache.get(`omdb_movie_${cleanId}_full`);
      if (memCached) {
        return memCached;
      }

      // Check MongoDB cache
      const dbMatch = await Movie.findOne({ externalMovieId: cleanId });
      if (dbMatch) {
        const mapped = mapDbMovieToOurShape(dbMatch);
        cache.set(`omdb_movie_${cleanId}_full`, mapped, 24 * 60 * 60 * 1000);
        return mapped;
      }

      // If ID starts with tt, fetch from OMDb API
      if (cleanId.startsWith('tt')) {
        const movie = await omdbService.details(cleanId);
        if (movie) {
          await upsertMovieToDb(movie);
          return movie;
        }
      }
    } catch (err) {
      if (err.statusCode === 404) {
        throw err;
      }
      console.warn(`[MovieService] OMDb details failed (${err.message}). Checking local catalog.`);
    }
  }

  // 4. Search local movies by externalId or index
  const localMatch = localMovies.find(
    (m) => m.externalId === cleanId || m.externalId === `local-${cleanId}`
  );
  if (localMatch) {
    await upsertMovieToDb(localMatch);
    return localMatch;
  }

  // 5. Check MongoDB cache as last resort
  try {
    const dbMatch = await Movie.findOne({
      $or: [
        { externalMovieId: cleanId },
        { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null },
      ],
    });
    if (dbMatch) {
      return mapDbMovieToOurShape(dbMatch);
    }
  } catch (err) {
    // Ignore invalid Mongo ObjectId errors
  }

  throw new AppError(`Movie with ID "${cleanId}" not found.`, 404);
};

/**
 * Get Similar Movies: TMDb -> OMDb (same genres from curated set) -> Local
 */
const getSimilarMovies = async (id, page = 1) => {
  if (!id || String(id).trim() === '') {
    throw new AppError('A valid movie ID must be provided.', 400);
  }

  const cleanId = String(id).trim();

  // 1. Try TMDb if enabled and numeric
  if (isTmdbEnabled() && !cleanId.startsWith('local-') && !cleanId.startsWith('tt')) {
    try {
      const data = await tmdbService.getSimilar(cleanId, page);
      return { source: 'tmdb', ...data };
    } catch (err) {
      console.warn(`[MovieService] TMDb similar failed (${err.message}). Checking OMDb / local.`);
    }
  }

  // 2. Try OMDb if enabled (computed from same genres in curated set)
  if (await isOmdbEnabled()) {
    try {
      let refMovie = null;
      try {
        refMovie = await getMovieDetails(cleanId);
      } catch (err) {
        if (err.statusCode === 404) throw err;
      }

      if (refMovie) {
        const targetGenres = new Set((refMovie.genres || []).map((g) => g.toLowerCase()));
        const curated = await getHydratedCuratedMovies();

        const similar = curated
          .filter(
            (m) =>
              m.externalId !== cleanId &&
              (m.genres || []).some((g) => targetGenres.has(g.toLowerCase()))
          )
          .sort((a, b) => {
            const ratingA = typeof a.rating === 'number' ? a.rating : 0;
            const ratingB = typeof b.rating === 'number' ? b.rating : 0;
            if (ratingB !== ratingA) return ratingB - ratingA;
            return (b.popularity || 0) - (a.popularity || 0);
          });

        const pageSize = 12;
        const pageNum = Math.max(1, Number(page) || 1);
        const totalResults = similar.length;
        const totalPages = Math.ceil(totalResults / pageSize) || 1;
        const offset = (pageNum - 1) * pageSize;

        return {
          source: 'omdb',
          page: pageNum,
          totalPages,
          totalResults,
          results: similar.slice(offset, offset + pageSize),
        };
      }
    } catch (err) {
      if (err.statusCode === 404) throw err;
      console.warn(`[MovieService] OMDb similar failed (${err.message}). Falling back to local data.`);
    }
  }

  // 3. Fallback to local dataset
  let refMovie = localMovies.find((m) => m.externalId === cleanId);
  if (!refMovie) {
    refMovie = localMovies[0];
  }

  const targetGenres = new Set((refMovie.genres || []).map((g) => g.toLowerCase()));
  const similar = localMovies
    .filter(
      (m) =>
        m.externalId !== cleanId &&
        (m.genres || []).some((g) => targetGenres.has(g.toLowerCase()))
    )
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const totalResults = similar.length;
  const pageSize = 12;
  const pageNum = Math.max(1, Number(page) || 1);
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const offset = (pageNum - 1) * pageSize;

  return {
    source: 'local',
    page: pageNum,
    totalPages,
    totalResults,
    results: similar.slice(offset, offset + pageSize),
  };
};

module.exports = {
  isTmdbEnabled,
  isOmdbEnabled,
  searchMovies,
  getTrendingMovies,
  getPopularMovies,
  getMovieGenres,
  getMovieDetails,
  getSimilarMovies,
  getHydratedCuratedMovies,
  searchLocalMovies,
};
