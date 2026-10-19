const axios = require('axios');
const cache = require('../utils/cache');
const AppError = require('../utils/AppError');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_POSTER = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_BACKDROP = 'https://image.tmdb.org/t/p/original';

// Create configured Axios client with 8-second timeout
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
});

// Interceptor to attach API Key (query parameter v3 auth)
tmdbClient.interceptors.request.use((config) => {
  const apiKey = process.env.MOVIE_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new AppError('TMDb API key is not configured.', 500);
  }
  config.params = config.params || {};
  config.params.api_key = apiKey.trim();
  return config;
});

// Interceptor to transform TMDb errors into descriptive errors
tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new AppError('TMDb service timeout after 8 seconds.', 504);
    }
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new AppError('Invalid TMDb API Key.', 401);
      }
      if (status === 429) {
        throw new AppError('TMDb API rate limit exceeded. Please try again later.', 429);
      }
      if (status === 404) {
        throw new AppError('Movie not found on TMDb.', 404);
      }
      throw new AppError(
        `TMDb API responded with status ${status}: ${error.response.data?.status_message || error.message}`,
        status
      );
    }
    throw new AppError(`TMDb request failed: ${error.message}`, 502);
  }
);

/**
 * Normalizes any TMDb movie object into our unified application movie shape.
 * Handles missing posters, backdrops, ratings, runtime, cast, director, and trailer gracefully.
 */
const mapTmdbMovieToOurShape = (item, genreMap = {}) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  // 1. Resolve genre names
  let genres = [];
  if (Array.isArray(item.genres) && item.genres.length > 0) {
    genres = item.genres.map((g) => (typeof g === 'string' ? g : g.name)).filter(Boolean);
  } else if (Array.isArray(item.genre_ids) && item.genre_ids.length > 0) {
    genres = item.genre_ids
      .map((id) => genreMap[id] || genreMap[String(id)])
      .filter(Boolean);
  }

  // 2. Poster and Backdrop URLs
  const posterUrl = item.poster_path
    ? `${TMDB_IMAGE_BASE_POSTER}${item.poster_path}`
    : (typeof item.posterUrl === 'string' ? item.posterUrl : '');
  const backdropUrl = item.backdrop_path
    ? `${TMDB_IMAGE_BASE_BACKDROP}${item.backdrop_path}`
    : (typeof item.backdropUrl === 'string' ? item.backdropUrl : '');

  // 3. Extract Cast & Director from credits (if present)
  let cast = [];
  let director = '';
  if (item.credits && typeof item.credits === 'object') {
    if (Array.isArray(item.credits.cast)) {
      cast = item.credits.cast.slice(0, 8).map((c) => c.name).filter(Boolean);
    }
    if (Array.isArray(item.credits.crew)) {
      const dirObj = item.credits.crew.find(
        (c) => c.job === 'Director' || c.department === 'Directing'
      );
      if (dirObj && dirObj.name) {
        director = dirObj.name;
      }
    }
  } else if (Array.isArray(item.cast)) {
    cast = item.cast;
    director = item.director || '';
  }

  // 4. Extract Trailer URL from videos (if present)
  let trailerUrl = '';
  if (item.videos && Array.isArray(item.videos.results)) {
    const trailer =
      item.videos.results.find(
        (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      ) ||
      item.videos.results.find((v) => v.site === 'YouTube');
    if (trailer && trailer.key) {
      trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    }
  } else if (typeof item.trailerUrl === 'string') {
    trailerUrl = item.trailerUrl;
  }

  // 5. Ratings and runtime
  const rawRating = item.vote_average ?? item.rating ?? 0;
  const rating = Number.isFinite(rawRating) ? Math.round(Number(rawRating) * 10) / 10 : 0;
  const runtime = Number.isFinite(item.runtime) ? Number(item.runtime) : 0;
  const popularity = Number.isFinite(item.popularity) ? Math.round(Number(item.popularity) * 10) / 10 : 0;

  return {
    externalId: String(item.id || item.externalId || item.externalMovieId || ''),
    title: item.title || item.name || 'Untitled',
    releaseDate: item.release_date || item.first_air_date || item.releaseDate || '',
    genres,
    overview: item.overview || '',
    posterUrl,
    backdropUrl,
    rating,
    runtime,
    language: item.original_language || item.language || 'en',
    popularity,
    cast,
    director,
    trailerUrl,
    source: 'tmdb',
  };
};

/**
 * Fetch and cache official genre mapping from TMDb (ID -> Name)
 */
const getGenreMap = async () => {
  const cacheKey = 'tmdb_genres_map';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const res = await tmdbClient.get('/genre/movie/list');
  const map = {};
  if (res.data && Array.isArray(res.data.genres)) {
    res.data.genres.forEach((g) => {
      map[g.id] = g.name;
    });
  }

  cache.set(cacheKey, map, 24 * 60 * 60 * 1000); // Cache for 24h
  return map;
};

/**
 * Get genres list
 */
const getGenres = async () => {
  const cacheKey = 'tmdb_genres_list';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const res = await tmdbClient.get('/genre/movie/list');
  const genres = res.data?.genres || [];
  cache.set(cacheKey, genres, 24 * 60 * 60 * 1000);
  return genres;
};

/**
 * Search movies on TMDb with optional filtering
 */
const searchMovies = async ({ query, year, page = 1 }) => {
  const genreMap = await getGenreMap();
  const params = {
    query: query || '',
    page,
    include_adult: false,
  };
  if (year) params.primary_release_year = year;

  const endpoint = query ? '/search/movie' : '/discover/movie';
  const res = await tmdbClient.get(endpoint, { params });

  const results = (res.data?.results || []).map((item) =>
    mapTmdbMovieToOurShape(item, genreMap)
  );

  return {
    page: res.data?.page || 1,
    totalPages: res.data?.total_pages || 1,
    totalResults: res.data?.total_results || results.length,
    results,
  };
};

/**
 * Get Trending Movies (cached for 10 minutes)
 */
const getTrending = async (page = 1) => {
  const cacheKey = `tmdb_trending_page_${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const genreMap = await getGenreMap();
  const res = await tmdbClient.get('/trending/movie/week', { params: { page } });

  const data = {
    page: res.data?.page || 1,
    totalPages: res.data?.total_pages || 1,
    totalResults: res.data?.total_results || 0,
    results: (res.data?.results || []).map((item) =>
      mapTmdbMovieToOurShape(item, genreMap)
    ),
  };

  cache.set(cacheKey, data, 10 * 60 * 1000);
  return data;
};

/**
 * Get Popular Movies (cached for 10 minutes)
 */
const getPopular = async (page = 1) => {
  const cacheKey = `tmdb_popular_page_${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const genreMap = await getGenreMap();
  const res = await tmdbClient.get('/movie/popular', { params: { page } });

  const data = {
    page: res.data?.page || 1,
    totalPages: res.data?.total_pages || 1,
    totalResults: res.data?.total_results || 0,
    results: (res.data?.results || []).map((item) =>
      mapTmdbMovieToOurShape(item, genreMap)
    ),
  };

  cache.set(cacheKey, data, 10 * 60 * 1000);
  return data;
};

/**
 * Get detailed movie metadata with credits and videos (cached for 10 minutes)
 */
const getDetails = async (id) => {
  const cacheKey = `tmdb_movie_${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const res = await tmdbClient.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos' },
  });

  const movie = mapTmdbMovieToOurShape(res.data);
  cache.set(cacheKey, movie, 10 * 60 * 1000);
  return movie;
};

/**
 * Get Similar Movies for a movie ID
 */
const getSimilar = async (id, page = 1) => {
  const cacheKey = `tmdb_similar_${id}_page_${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const genreMap = await getGenreMap();
  const res = await tmdbClient.get(`/movie/${id}/similar`, { params: { page } });

  const data = {
    page: res.data?.page || 1,
    totalPages: res.data?.total_pages || 1,
    totalResults: res.data?.total_results || 0,
    results: (res.data?.results || []).map((item) =>
      mapTmdbMovieToOurShape(item, genreMap)
    ),
  };

  cache.set(cacheKey, data, 10 * 60 * 1000);
  return data;
};

module.exports = {
  mapTmdbMovieToOurShape,
  getGenreMap,
  getGenres,
  searchMovies,
  getTrending,
  getPopular,
  getDetails,
  getSimilar,
};
