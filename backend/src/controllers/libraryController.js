const User = require('../models/User');
const Movie = require('../models/Movie');
const { resolveMovieDocument } = require('../utils/movieResolver');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc   Get authenticated user's watchlist
 * @route  GET /api/watchlist
 * @access Protected
 */
const getWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('watchlist');
  const items = user ? user.watchlist : [];

  res.status(200).json({
    success: true,
    count: items.length,
    watchlist: items,
  });
});

/**
 * @desc   Add movie to watchlist
 * @route  POST /api/watchlist
 * @access Protected
 */
const addToWatchlist = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  if (!movieId || typeof movieId !== 'string' || movieId.trim() === '') {
    throw new AppError('A valid movieId must be provided.', 400);
  }

  const movieDoc = await resolveMovieDocument(movieId);
  const user = await User.findById(req.user._id);

  const alreadySaved = user.watchlist.some(
    (id) => id.toString() === movieDoc._id.toString()
  );
  if (alreadySaved) {
    return res.status(409).json({
      success: false,
      message: 'Movie is already in your watchlist.',
    });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchlist: movieDoc._id },
  });

  res.status(201).json({
    success: true,
    message: 'Movie added to watchlist.',
    movie: movieDoc,
  });
});

/**
 * @desc   Remove movie from watchlist
 * @route  DELETE /api/watchlist/:id
 * @access Protected
 */
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const user = await User.findById(req.user._id).populate('watchlist');

  // Match targetId against either MongoDB _id or externalMovieId
  const matchedItem = (user.watchlist || []).find(
    (m) =>
      m._id.toString() === targetId ||
      m.externalMovieId === targetId
  );

  if (!matchedItem) {
    return res.status(404).json({
      success: false,
      message: 'Movie not found in your watchlist.',
    });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { watchlist: matchedItem._id },
  });

  res.status(200).json({
    success: true,
    message: 'Movie removed from watchlist.',
  });
});

/**
 * @desc   Get authenticated user's favorites
 * @route  GET /api/favorites
 * @access Protected
 */
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favoriteMovies');
  const items = user ? user.favoriteMovies : [];

  res.status(200).json({
    success: true,
    count: items.length,
    favorites: items,
  });
});

/**
 * @desc   Add movie to favorites
 * @route  POST /api/favorites
 * @access Protected
 */
const addToFavorites = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  if (!movieId || typeof movieId !== 'string' || movieId.trim() === '') {
    throw new AppError('A valid movieId must be provided.', 400);
  }

  const movieDoc = await resolveMovieDocument(movieId);
  const user = await User.findById(req.user._id);

  const alreadySaved = user.favoriteMovies.some(
    (id) => id.toString() === movieDoc._id.toString()
  );
  if (alreadySaved) {
    return res.status(409).json({
      success: false,
      message: 'Movie is already in your favorites.',
    });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { favoriteMovies: movieDoc._id },
  });

  res.status(201).json({
    success: true,
    message: 'Movie added to favorites.',
    movie: movieDoc,
  });
});

/**
 * @desc   Remove movie from favorites
 * @route  DELETE /api/favorites/:id
 * @access Protected
 */
const removeFromFavorites = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const user = await User.findById(req.user._id).populate('favoriteMovies');

  const matchedItem = (user.favoriteMovies || []).find(
    (m) =>
      m._id.toString() === targetId ||
      m.externalMovieId === targetId
  );

  if (!matchedItem) {
    return res.status(404).json({
      success: false,
      message: 'Movie not found in your favorites.',
    });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { favoriteMovies: matchedItem._id },
  });

  res.status(200).json({
    success: true,
    message: 'Movie removed from favorites.',
  });
});

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
};
