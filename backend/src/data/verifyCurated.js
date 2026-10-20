const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const curatedMovies = require('./curatedImdbIds');
const omdbService = require('../services/omdbService');
const Movie = require('../models/Movie');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const results = [];
  const wrong = [];
  let requestCount = 0;
  let dbCacheHits = 0;

  for (let i = 0; i < curatedMovies.length; i++) {
    const item = curatedMovies[i];
    try {
      // 1. Check MongoDB cache first to save requests
      let movie = await Movie.findOne({ externalMovieId: item.imdbId });
      if (movie) {
        dbCacheHits++;
      } else {
        requestCount++;
        movie = await omdbService.details(item.imdbId);
        if (movie) {
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
              source: 'omdb',
            },
            { upsert: true, returnDocument: 'after' }
          );
        }
      }

      if (!movie) {
        console.error(`[FAIL] ${item.imdbId}: No movie returned`);
        wrong.push({ item, reason: 'No data' });
        continue;
      }

      const expected = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const actual = movie.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = actual.includes(expected) || expected.includes(actual);

      if (matched) {
        results.push({ imdbId: item.imdbId, expected: item.title, actual: movie.title });
      } else {
        console.warn(`[TITLE MISMATCH] Expected "${item.title}", got "${movie.title}" (${item.imdbId})`);
        wrong.push({ item, actual: movie.title });
      }
    } catch (err) {
      console.error(`[ERROR] ${item.imdbId} (${item.title}):`, err.message);
      wrong.push({ item, reason: err.message });
    }
  }

  console.log(`\nVerification Complete!`);
  console.log(`Total Curated: ${curatedMovies.length}`);
  console.log(`Matched: ${results.length}`);
  console.log(`Wrong / Mismatches: ${wrong.length}`);
  console.log(`DB Cache Hits: ${dbCacheHits}`);
  console.log(`New OMDb Requests Used: ${requestCount}`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
