const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { mapTmdbMovieToOurShape } = require('./tmdbService');

describe('TMDb Response Normalizer & Mapper', () => {
  const genreMap = {
    28: 'Action',
    12: 'Adventure',
    878: 'Sci-Fi',
    18: 'Drama',
  };

  test('1. Maps complete TMDb object with credits and videos correctly', () => {
    const rawTmdb = {
      id: 550,
      title: 'Fight Club',
      release_date: '1999-10-15',
      genres: [{ id: 18, name: 'Drama' }],
      overview: 'An insomniac office worker...',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      vote_average: 8.433,
      runtime: 139,
      original_language: 'en',
      popularity: 88.5,
      credits: {
        cast: [{ name: 'Edward Norton' }, { name: 'Brad Pitt' }],
        crew: [{ job: 'Director', name: 'David Fincher' }],
      },
      videos: {
        results: [
          { site: 'YouTube', type: 'Trailer', key: 'qtRKdV9zM49' },
        ],
      },
    };

    const mapped = mapTmdbMovieToOurShape(rawTmdb, genreMap);

    assert.equal(mapped.externalId, '550');
    assert.equal(mapped.title, 'Fight Club');
    assert.equal(mapped.releaseDate, '1999-10-15');
    assert.deepEqual(mapped.genres, ['Drama']);
    assert.equal(mapped.posterUrl, 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');
    assert.equal(mapped.backdropUrl, 'https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg');
    assert.equal(mapped.rating, 8.4);
    assert.equal(mapped.runtime, 139);
    assert.equal(mapped.language, 'en');
    assert.deepEqual(mapped.cast, ['Edward Norton', 'Brad Pitt']);
    assert.equal(mapped.director, 'David Fincher');
    assert.equal(mapped.trailerUrl, 'https://www.youtube.com/watch?v=qtRKdV9zM49');
    assert.equal(mapped.source, 'tmdb');
  });

  test('2. Resolves genre_ids using provided genreMap when genres array is absent', () => {
    const rawTmdb = {
      id: 999,
      title: 'Action Movie',
      genre_ids: [28, 878],
    };

    const mapped = mapTmdbMovieToOurShape(rawTmdb, genreMap);
    assert.deepEqual(mapped.genres, ['Action', 'Sci-Fi']);
  });

  test('3. Gracefully handles missing poster, backdrop, runtime, rating without crashing', () => {
    const rawTmdb = {
      id: 1234,
      title: 'Indie Film Without Metadata',
    };

    const mapped = mapTmdbMovieToOurShape(rawTmdb, genreMap);

    assert.equal(mapped.externalId, '1234');
    assert.equal(mapped.title, 'Indie Film Without Metadata');
    assert.equal(mapped.posterUrl, '');
    assert.equal(mapped.backdropUrl, '');
    assert.equal(mapped.rating, 0);
    assert.equal(mapped.runtime, 0);
    assert.equal(mapped.trailerUrl, '');
    assert.equal(mapped.director, '');
    assert.deepEqual(mapped.cast, []);
    assert.deepEqual(mapped.genres, []);
  });

  test('4. Gracefully handles null or invalid inputs', () => {
    assert.equal(mapTmdbMovieToOurShape(null), null);
    assert.equal(mapTmdbMovieToOurShape(undefined), null);
    assert.equal(mapTmdbMovieToOurShape('invalid string'), null);
  });
});
