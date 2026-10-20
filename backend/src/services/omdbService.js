const axios = require('axios');
const cache = require('../utils/cache');
const AppError = require('../utils/AppError');

const OMDB_BASE_URL = 'https://www.omdbapi.com/';

// Create Axios client with 8-second timeout
const omdbClient = axios.create({
  baseURL: OMDB_BASE_URL,
  timeout: 8000,
});

let lastValidatedKey = null;
let isKeyValid = false;
let keyValidationExpiry = 0;

/**
 * Validate OMDB_API_KEY with lightweight check and cache the result
 */
const validateKey = async () => {
  const key = process.env.OMDB_API_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return false;
  }
  const cleanKey = key.trim();
  const now = Date.now();

  if (lastValidatedKey === cleanKey && now < keyValidationExpiry) {
    return isKeyValid;
  }

  // Key changed or cache expired: clear curated memory cache
  cache.delete('hydrated_curated_omdb_movies');

  try {
    const res = await omdbClient.get('', {
      params: { apikey: cleanKey, i: 'tt1375666' },
      timeout: 5000,
    });
    if (res.data?.Response === 'True') {
      lastValidatedKey = cleanKey;
      isKeyValid = true;
      keyValidationExpiry = now + 60 * 60 * 1000; // 1 hour TTL
      return true;
    }
    lastValidatedKey = cleanKey;
    isKeyValid = false;
    keyValidationExpiry = now + 30 * 1000;
    return false;
  } catch {
    lastValidatedKey = cleanKey;
    isKeyValid = false;
    keyValidationExpiry = now + 30 * 1000;
    return false;
  }
};

/**
 * Safely retrieve OMDB_API_KEY from environment without logging it
 */
const getApiKey = () => {
  const key = process.env.OMDB_API_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    throw new AppError('OMDb API key is not configured.', 500);
  }
  return key.trim();
};

/**
 * Normalizes an OMDb movie or search item into our unified application movie shape.
 * Handles "N/A" values by converting them to null or empty arrays/strings as required.
 */
const mapOmdbMovieToOurShape = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  // 1. External ID (IMDb ID)
  const externalId = String(item.imdbID || item.externalId || item.id || '').trim();

  // 2. Title
  const title = (item.Title && item.Title !== 'N/A') ? String(item.Title).trim() : 'Untitled';

  // 3. Release Date (prefer Released date, fallback to Year)
  let releaseDate = '';
  if (item.Released && item.Released !== 'N/A') {
    releaseDate = String(item.Released).trim();
  } else if (item.Year && item.Year !== 'N/A') {
    releaseDate = String(item.Year).trim();
  }

  // 4. Genres (comma-separated string to array of trimmed names)
  let genres = [];
  if (Array.isArray(item.genres)) {
    genres = item.genres;
  } else if (item.Genre && item.Genre !== 'N/A') {
    genres = item.Genre.split(',').map((g) => g.trim()).filter(Boolean);
  }

  // 5. Overview / Plot
  const overview = (item.Plot && item.Plot !== 'N/A') ? String(item.Plot).trim() : '';

  // 6. Poster & Backdrop URLs (backdrop is empty for OMDb)
  const posterUrl = (item.Poster && item.Poster !== 'N/A') ? String(item.Poster).trim() : '';
  const backdropUrl = '';

  // 7. Rating (imdbRating as Number, or null if "N/A" / invalid)
  let rating = null;
  if (item.imdbRating && item.imdbRating !== 'N/A') {
    const parsed = Number(item.imdbRating);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      rating = Math.round(parsed * 10) / 10;
    }
  }

  // 8. Runtime (parse number in minutes, or null if "N/A" / missing)
  let runtime = null;
  if (item.Runtime && item.Runtime !== 'N/A') {
    const match = String(item.Runtime).match(/\d+/);
    if (match) {
      runtime = parseInt(match[0], 10);
    }
  }

  // 9. Language (primary language in lowercase)
  let language = 'en';
  if (item.Language && item.Language !== 'N/A') {
    const primary = item.Language.split(',')[0].trim().toLowerCase();
    if (primary) language = primary;
  }

  // 10. Popularity (derived from imdbVotes)
  let popularity = 0;
  if (item.imdbVotes && item.imdbVotes !== 'N/A') {
    const cleanVotes = String(item.imdbVotes).replace(/,/g, '').trim();
    const parsedVotes = Number(cleanVotes);
    if (!isNaN(parsedVotes)) {
      popularity = parsedVotes;
    }
  } else if (typeof item.popularity === 'number') {
    popularity = item.popularity;
  }

  // 11. Cast (Actors comma-separated string to array)
  let cast = [];
  if (Array.isArray(item.cast)) {
    cast = item.cast;
  } else if (item.Actors && item.Actors !== 'N/A') {
    cast = item.Actors.split(',').map((a) => a.trim()).filter(Boolean);
  }

  // 12. Director
  const director = (item.Director && item.Director !== 'N/A') ? String(item.Director).trim() : '';

  // 13. Trailer URL (empty for OMDb)
  const trailerUrl = '';

  return {
    externalId,
    title,
    releaseDate,
    genres,
    overview,
    posterUrl,
    backdropUrl,
    rating,
    runtime,
    language,
    popularity,
    cast,
    director,
    trailerUrl,
    source: 'omdb',
  };
};

/**
 * Handle OMDb Axios and API response errors cleanly without leaking keys
 */
const handleOmdbError = (error, context = '') => {
  if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
    throw new AppError('OMDb service timeout after 8 seconds.', 504);
  }

  if (error.response) {
    const status = error.response.status;
    if (status === 401) {
      throw new AppError('Invalid OMDb API Key.', 401);
    }
    if (status === 429) {
      throw new AppError('OMDb API daily request limit reached.', 429);
    }
    if (status === 404) {
      throw new AppError('Movie not found on OMDb.', 404);
    }
    throw new AppError(`OMDb API responded with status ${status}.`, status);
  }

  if (error instanceof AppError) {
    throw error;
  }

  throw new AppError(`OMDb request failed${context ? ' during ' + context : ''}: ${error.message}`, 502);
};

/**
 * Search movies by title (s=) with pagination
 */
const search = async ({ query, page = 1, type = 'movie', year = '' } = {}) => {
  if (!query || String(query).trim() === '') {
    return {
      page: 1,
      totalPages: 1,
      totalResults: 0,
      results: [],
    };
  }

  const apiKey = getApiKey();
  const pageNum = Math.max(1, Number(page) || 1);
  const params = {
    apikey: apiKey,
    s: String(query).trim(),
    page: pageNum,
  };
  if (type) params.type = type;
  if (year && String(year).trim()) params.y = String(year).trim();

  try {
    const res = await omdbClient.get('', { params });
    const data = res.data;

    if (data?.Response === 'False') {
      const errMsg = data.Error || '';
      if (errMsg.includes('Invalid API key') || errMsg.includes('not authorized')) {
        throw new AppError('Invalid OMDb API Key.', 401);
      }
      if (errMsg.toLowerCase().includes('limit') || errMsg.includes('Request limit reached')) {
        throw new AppError('OMDb API daily request limit reached.', 429);
      }
      if (errMsg.includes('Movie not found') || errMsg.includes('Too many results')) {
        return {
          page: pageNum,
          totalPages: 1,
          totalResults: 0,
          results: [],
        };
      }
      throw new AppError(`OMDb search error: ${errMsg}`, 400);
    }

    const totalResults = parseInt(data.totalResults, 10) || (data.Search || []).length;
    const totalPages = Math.ceil(totalResults / 10) || 1;
    const searchItems = data.Search || [];

    return {
      page: pageNum,
      totalPages,
      totalResults,
      results: searchItems,
    };
  } catch (err) {
    handleOmdbError(err, 'search');
  }
};

/**
 * Get full movie details by IMDb ID (i=)
 */
const details = async (imdbId, plot = 'full') => {
  if (!imdbId || typeof imdbId !== 'string' || imdbId.trim() === '') {
    throw new AppError('A valid movie ID must be provided.', 400);
  }

  const cleanId = imdbId.trim();
  const cacheKey = `omdb_movie_${cleanId}_${plot}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = getApiKey();
  const params = {
    apikey: apiKey,
    i: cleanId,
    plot,
  };

  try {
    const res = await omdbClient.get('', { params });
    const data = res.data;

    if (data?.Response === 'False') {
      const errMsg = data.Error || '';
      if (errMsg.includes('Invalid API key') || errMsg.includes('not authorized')) {
        throw new AppError('Invalid OMDb API Key.', 401);
      }
      if (errMsg.toLowerCase().includes('limit') || errMsg.includes('Request limit reached')) {
        throw new AppError('OMDb API daily request limit reached.', 429);
      }
      if (errMsg.includes('Movie not found') || errMsg.includes('Incorrect IMDb ID')) {
        throw new AppError(`Movie with ID "${cleanId}" not found.`, 404);
      }
      throw new AppError(`OMDb error: ${errMsg}`, 400);
    }

    const mapped = mapOmdbMovieToOurShape(data);
    cache.set(cacheKey, mapped, 24 * 60 * 60 * 1000); // 24-hour in-memory cache
    return mapped;
  } catch (err) {
    handleOmdbError(err, 'details');
  }
};

module.exports = {
  mapOmdbMovieToOurShape,
  search,
  details,
  getApiKey,
  validateKey,
};
