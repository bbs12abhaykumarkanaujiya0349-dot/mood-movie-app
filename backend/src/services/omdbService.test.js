const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { mapOmdbMovieToOurShape } = require('./omdbService');

describe('OMDb Response Normalizer & Mapper', () => {
  test('1. Maps complete OMDb object into unified movie shape', () => {
    const rawOmdb = {
      Title: 'Inception',
      Year: '2010',
      Released: '16 Jul 2010',
      Runtime: '148 min',
      Genre: 'Action, Adventure, Sci-Fi',
      Director: 'Christopher Nolan',
      Actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
      Plot: 'A thief who steals corporate secrets through the use of dream-sharing technology...',
      Language: 'English, Japanese, French',
      Poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
      imdbRating: '8.8',
      imdbVotes: '2,600,000',
      imdbID: 'tt1375666',
      Type: 'movie',
      Response: 'True',
    };

    const mapped = mapOmdbMovieToOurShape(rawOmdb);

    assert.equal(mapped.externalId, 'tt1375666');
    assert.equal(mapped.title, 'Inception');
    assert.equal(mapped.releaseDate, '16 Jul 2010');
    assert.deepEqual(mapped.genres, ['Action', 'Adventure', 'Sci-Fi']);
    assert.equal(
      mapped.overview,
      'A thief who steals corporate secrets through the use of dream-sharing technology...'
    );
    assert.equal(
      mapped.posterUrl,
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg'
    );
    assert.equal(mapped.backdropUrl, '');
    assert.equal(mapped.rating, 8.8);
    assert.equal(mapped.runtime, 148);
    assert.equal(mapped.language, 'english');
    assert.equal(mapped.popularity, 2600000);
    assert.deepEqual(mapped.cast, ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page']);
    assert.equal(mapped.director, 'Christopher Nolan');
    assert.equal(mapped.trailerUrl, '');
    assert.equal(mapped.source, 'omdb');
  });

  test('2. Treats "N/A" values as null or empty representations correctly', () => {
    const rawOmdbWithNA = {
      Title: 'Indie Documentary',
      Year: '2021',
      Released: 'N/A',
      Runtime: 'N/A',
      Genre: 'N/A',
      Director: 'N/A',
      Actors: 'N/A',
      Plot: 'N/A',
      Language: 'N/A',
      Poster: 'N/A',
      imdbRating: 'N/A',
      imdbVotes: 'N/A',
      imdbID: 'tt9999999',
      Type: 'movie',
      Response: 'True',
    };

    const mapped = mapOmdbMovieToOurShape(rawOmdbWithNA);

    assert.equal(mapped.externalId, 'tt9999999');
    assert.equal(mapped.title, 'Indie Documentary');
    assert.equal(mapped.releaseDate, '2021'); // Falls back to Year when Released is N/A
    assert.deepEqual(mapped.genres, []);
    assert.equal(mapped.overview, '');
    assert.equal(mapped.posterUrl, '');
    assert.equal(mapped.backdropUrl, '');
    assert.equal(mapped.rating, null); // rating is strictly null when N/A
    assert.equal(mapped.runtime, null); // runtime is strictly null when N/A
    assert.equal(mapped.language, 'en');
    assert.equal(mapped.popularity, 0);
    assert.deepEqual(mapped.cast, []);
    assert.equal(mapped.director, '');
    assert.equal(mapped.trailerUrl, '');
    assert.equal(mapped.source, 'omdb');
  });

  test('3. Handles missing or undefined fields with safe defaults', () => {
    const rawMinimal = {
      imdbID: 'tt1234567',
      Title: 'Minimal Film',
    };

    const mapped = mapOmdbMovieToOurShape(rawMinimal);

    assert.equal(mapped.externalId, 'tt1234567');
    assert.equal(mapped.title, 'Minimal Film');
    assert.equal(mapped.releaseDate, '');
    assert.deepEqual(mapped.genres, []);
    assert.equal(mapped.overview, '');
    assert.equal(mapped.posterUrl, '');
    assert.equal(mapped.backdropUrl, '');
    assert.equal(mapped.rating, null);
    assert.equal(mapped.runtime, null);
    assert.equal(mapped.language, 'en');
    assert.equal(mapped.popularity, 0);
    assert.deepEqual(mapped.cast, []);
    assert.equal(mapped.director, '');
    assert.equal(mapped.trailerUrl, '');
    assert.equal(mapped.source, 'omdb');
  });

  test('4. Gracefully returns null for non-object, null, or undefined inputs', () => {
    assert.equal(mapOmdbMovieToOurShape(null), null);
    assert.equal(mapOmdbMovieToOurShape(undefined), null);
    assert.equal(mapOmdbMovieToOurShape('invalid string'), null);
    assert.equal(mapOmdbMovieToOurShape(123), null);
  });
});
