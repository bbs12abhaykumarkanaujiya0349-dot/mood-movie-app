const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    externalMovieId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    releaseDate: {
      type: String,
      trim: true,
    },
    genres: {
      type: [String],
      default: [],
      index: true,
    },
    overview: {
      type: String,
      trim: true,
      default: '',
    },
    posterUrl: {
      type: String,
      trim: true,
      default: '',
    },
    backdropUrl: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
      index: true,
    },
    runtime: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'en',
      trim: true,
    },
    popularity: {
      type: Number,
      default: 0,
      index: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      trim: true,
      default: '',
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      enum: ['tmdb', 'local'],
      default: 'local',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for title & overview searching
movieSchema.index({ title: 'text', overview: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
