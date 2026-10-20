const Movie = require('../models/Movie');
const User = require('../models/User');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc   List movies from Movie collection for admin management
 * @route  GET /api/admin/movies
 * @access Protected (Admin only)
 */
const getAdminMovies = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search && search.trim() !== '') {
    const term = search.trim();
    query.$or = [
      { title: { $regex: term, $options: 'i' } },
      { director: { $regex: term, $options: 'i' } },
      { externalMovieId: { $regex: term, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [total, movies] = await Promise.all([
    Movie.countDocuments(query),
    Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  res.status(200).json({
    success: true,
    count: movies.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    movies,
  });
});

/**
 * @desc   Manually create a new movie (source: "local")
 * @route  POST /api/admin/movies
 * @access Protected (Admin only)
 */
const createAdminMovie = asyncHandler(async (req, res) => {
  const {
    title,
    genres,
    releaseDate,
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
    externalMovieId,
  } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError('Movie title is required.', 400);
  }

  // Normalize genres array
  let normalizedGenres = [];
  if (Array.isArray(genres)) {
    normalizedGenres = genres.map((g) => String(g).trim()).filter(Boolean);
  } else if (typeof genres === 'string') {
    normalizedGenres = genres.split(',').map((g) => g.trim()).filter(Boolean);
  }

  // Normalize cast array
  let normalizedCast = [];
  if (Array.isArray(cast)) {
    normalizedCast = cast.map((c) => String(c).trim()).filter(Boolean);
  } else if (typeof cast === 'string') {
    normalizedCast = cast.split(',').map((c) => c.trim()).filter(Boolean);
  }

  const extId = externalMovieId && externalMovieId.trim() !== ''
    ? externalMovieId.trim()
    : `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const movie = await Movie.create({
    externalMovieId: extId,
    title: title.trim(),
    genres: normalizedGenres,
    releaseDate: releaseDate ? String(releaseDate).trim() : '',
    overview: overview ? String(overview).trim() : '',
    posterUrl: posterUrl ? String(posterUrl).trim() : '',
    backdropUrl: backdropUrl ? String(backdropUrl).trim() : '',
    rating: typeof rating === 'number' && !isNaN(rating) ? Math.min(10, Math.max(0, rating)) : null,
    runtime: typeof runtime === 'number' && !isNaN(runtime) ? Math.max(0, runtime) : null,
    language: language ? String(language).trim().toLowerCase() : 'en',
    popularity: typeof popularity === 'number' && !isNaN(popularity) ? popularity : 50,
    cast: normalizedCast,
    director: director ? String(director).trim() : '',
    trailerUrl: trailerUrl ? String(trailerUrl).trim() : '',
    source: 'local',
  });

  res.status(201).json({
    success: true,
    message: 'Movie created successfully.',
    movie,
  });
});

/**
 * @desc   Update movie metadata
 * @route  PATCH /api/admin/movies/:id
 * @access Protected (Admin only)
 */
const updateAdminMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    throw new AppError('Movie not found.', 404);
  }

  const {
    title,
    genres,
    releaseDate,
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
  } = req.body;

  if (title !== undefined) movie.title = String(title).trim();
  if (releaseDate !== undefined) movie.releaseDate = String(releaseDate).trim();
  if (overview !== undefined) movie.overview = String(overview).trim();
  if (posterUrl !== undefined) movie.posterUrl = String(posterUrl).trim();
  if (backdropUrl !== undefined) movie.backdropUrl = String(backdropUrl).trim();
  if (language !== undefined) movie.language = String(language).trim().toLowerCase();
  if (director !== undefined) movie.director = String(director).trim();
  if (trailerUrl !== undefined) movie.trailerUrl = String(trailerUrl).trim();

  if (rating !== undefined) {
    movie.rating = rating === null || isNaN(rating) ? null : Math.min(10, Math.max(0, Number(rating)));
  }
  if (runtime !== undefined) {
    movie.runtime = runtime === null || isNaN(runtime) ? null : Math.max(0, Number(runtime));
  }
  if (popularity !== undefined) {
    movie.popularity = isNaN(popularity) ? movie.popularity : Number(popularity);
  }

  if (genres !== undefined) {
    if (Array.isArray(genres)) {
      movie.genres = genres.map((g) => String(g).trim()).filter(Boolean);
    } else if (typeof genres === 'string') {
      movie.genres = genres.split(',').map((g) => g.trim()).filter(Boolean);
    }
  }

  if (cast !== undefined) {
    if (Array.isArray(cast)) {
      movie.cast = cast.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof cast === 'string') {
      movie.cast = cast.split(',').map((c) => c.trim()).filter(Boolean);
    }
  }

  await movie.save();

  res.status(200).json({
    success: true,
    message: 'Movie updated successfully.',
    movie,
  });
});

/**
 * @desc   Delete movie and cascade remove from watchlist/favorites and reviews
 * @route  DELETE /api/admin/movies/:id
 * @access Protected (Admin only)
 */
const deleteAdminMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    throw new AppError('Movie not found.', 404);
  }

  // Cascade delete
  await Promise.all([
    Movie.findByIdAndDelete(movie._id),
    User.updateMany(
      {},
      {
        $pull: {
          watchlist: movie._id,
          favoriteMovies: movie._id,
        },
      }
    ),
    Review.deleteMany({ movieId: movie._id }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Movie deleted and removed from user libraries and reviews.',
  });
});

module.exports = {
  getAdminMovies,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie,
};
