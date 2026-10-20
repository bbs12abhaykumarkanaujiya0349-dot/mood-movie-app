const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const movieService = require('../services/movieService');
const AppError = require('./AppError');

/**
 * Resolves any movie identifier (MongoDB _id or externalId such as "tt1375666", "local-1")
 * into a persisted MongoDB Movie document reference.
 *
 * @param {string} idInput - Movie ID string
 * @returns {Promise<Document>} Persisted Movie document
 */
const resolveMovieDocument = async (idInput) => {
  if (!idInput || typeof idInput !== 'string' || idInput.trim() === '') {
    throw new AppError('A valid movie ID must be provided.', 400);
  }

  const cleanId = idInput.trim();

  // 1. Check if ID matches MongoDB ObjectId format
  if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
    const docById = await Movie.findById(cleanId);
    if (docById) return docById;
  }

  // 2. Check MongoDB collection by externalMovieId
  const docByExternal = await Movie.findOne({ externalMovieId: cleanId });
  if (docByExternal) return docByExternal;

  // 3. Resolve metadata through movieService (which lazily hydrates and handles fallbacks)
  const movieData = await movieService.getMovieDetails(cleanId);
  if (!movieData) {
    throw new AppError(`Movie with ID "${cleanId}" not found.`, 404);
  }

  // 4. Ensure it is upserted into the Movie collection and return the document
  const savedDoc = await Movie.findOneAndUpdate(
    { externalMovieId: movieData.externalId },
    {
      externalMovieId: movieData.externalId,
      title: movieData.title,
      releaseDate: movieData.releaseDate,
      genres: movieData.genres,
      overview: movieData.overview,
      posterUrl: movieData.posterUrl,
      backdropUrl: movieData.backdropUrl,
      rating: movieData.rating,
      runtime: movieData.runtime,
      language: movieData.language,
      popularity: movieData.popularity,
      cast: movieData.cast,
      director: movieData.director,
      trailerUrl: movieData.trailerUrl,
      source: movieData.source || 'omdb',
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  return savedDoc;
};

module.exports = {
  resolveMovieDocument,
};
