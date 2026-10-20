const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { recommendForMood, scoreMovieForMood } = require('./recommendationService');

describe('Recommendation Service (with OMDb candidates)', () => {
  const omdbCandidate1 = {
    externalId: 'tt1375666',
    title: 'Inception',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 8.8,
    runtime: 148,
    source: 'omdb',
    popularity: 2600000,
  };

  const omdbCandidateNullRating = {
    externalId: 'tt9999999',
    title: 'Unknown Indie Film',
    genres: ['Action', 'Thriller'],
    rating: null, // OMDb "N/A" rating
    runtime: null,
    source: 'omdb',
    popularity: 50,
  };

  const omdbCandidateFamily = {
    externalId: 'tt0114709',
    title: 'Toy Story',
    genres: ['Animation', 'Adventure', 'Comedy', 'Family'],
    rating: 8.3,
    runtime: 81,
    source: 'omdb',
    popularity: 1100000,
  };

  test('1. Correctly scores movie matching Excited mood genres', () => {
    const scored = scoreMovieForMood(omdbCandidate1, ['Action', 'Adventure', 'Sci-Fi']);
    assert.ok(scored.matchScore >= 80);
    assert.deepEqual(scored.matchedGenres, ['Action', 'Adventure', 'Sci-Fi']);
    assert.ok(scored.reason.includes('Matches') || scored.reason.includes('mood genres'));
  });

  test('2. Resiliently handles candidates with null ratings (OMDb N/A) without NaN', () => {
    const scored = scoreMovieForMood(omdbCandidateNullRating, ['Action', 'Thriller', 'Adventure']);
    assert.ok(typeof scored.matchScore === 'number' && !isNaN(scored.matchScore));
    assert.ok(scored.matchScore >= 30);
  });

  test('3. Recommends top matching movies for Happy mood', async () => {
    const candidates = [omdbCandidate1, omdbCandidateNullRating, omdbCandidateFamily];
    const result = await recommendForMood({ mood: 'Happy', candidates });

    assert.equal(result.mood, 'Happy');
    assert.equal(result.source, 'omdb');
    assert.ok(result.recommendations.length > 0);
    // Toy Story should rank highest for Happy mood because of Comedy & Family overlap
    assert.equal(result.recommendations[0].movie?.title || result.recommendations[0].title, 'Toy Story');
  });

  test('4. Gracefully handles invalid inputs and empty candidate lists', async () => {
    const result = await recommendForMood({ mood: 'Relaxed', candidates: [] });
    assert.equal(result.recommendations.length, 0);
    assert.equal(result.total, 0);
  });
});
