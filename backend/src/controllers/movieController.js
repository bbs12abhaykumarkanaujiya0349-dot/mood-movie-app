const movieService = require('../services/movieService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc   Search movies with filters, sorting, and pagination
 * @route  GET /api/movies/search
 * @access Public
 */
const search = asyncHandler(async (req, res) => {
  const { q, genre, year, minRating, language, sort, page, limit } = req.query;

  const data = await movieService.searchMovies({
    query: q,
    genre,
    year,
    minRating,
    language,
    sort: sort || 'popularity',
    page: Number(page) || 1,
    limit: Number(limit) || 12,
  });

  res.status(200).json({
    success: true,
    source: data.source,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    results: data.results,
  });
});

/**
 * @desc   Get trending movies
 * @route  GET /api/movies/trending
 * @access Public
 */
const getTrending = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const data = await movieService.getTrendingMovies(page);

  res.status(200).json({
    success: true,
    ...data,
  });
});

/**
 * @desc   Get popular movies
 * @route  GET /api/movies/popular
 * @access Public
 */
const getPopular = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const data = await movieService.getPopularMovies(page);

  res.status(200).json({
    success: true,
    ...data,
  });
});

/**
 * @desc   Get movie genre list
 * @route  GET /api/movies/genres
 * @access Public
 */
const getGenres = asyncHandler(async (req, res) => {
  const data = await movieService.getMovieGenres();

  res.status(200).json({
    success: true,
    ...data,
  });
});

/**
 * @desc   Get movie details by ID
 * @route  GET /api/movies/:id
 * @access Public
 */
const getDetails = asyncHandler(async (req, res) => {
  const movie = await movieService.getMovieDetails(req.params.id);

  res.status(200).json({
    success: true,
    source: movie.source || 'local',
    movie,
  });
});

/**
 * @desc   Get similar movies for a movie ID
 * @route  GET /api/movies/:id/similar
 * @access Public
 */
const getSimilar = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const data = await movieService.getSimilarMovies(req.params.id, page);

  res.status(200).json({
    success: true,
    ...data,
  });
});

module.exports = {
  search,
  getTrending,
  getPopular,
  getGenres,
  getDetails,
  getSimilar,
};
