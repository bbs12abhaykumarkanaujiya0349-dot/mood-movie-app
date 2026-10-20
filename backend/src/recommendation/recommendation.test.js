const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateMoodGenreScore,
  calculateRatingScore,
  calculatePopularityScore,
  calculateUserPrefScore,
  calculateHybridScore,
  SCORING_WEIGHTS,
} = require('./scoring');

const {
  buildRecommendationReason,
  formatGenreList,
} = require('./reasonBuilder');

const { analyzeSentiment } = require('../ai/sentimentAnalyzer');
const { getRecommendations } = require('../services/recommendationService');

describe('Hybrid Recommendation Engine & Scoring Unit Tests', () => {
  // Test candidate movies
  const movieInception = {
    externalId: 'tt1375666',
    title: 'Inception',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 8.8,
    popularity: 2600000,
  };

  const movieUnrated = {
    externalId: 'tt9999991',
    title: 'Indie Film',
    genres: ['Drama'],
    rating: null, // Missing rating
    popularity: 0,
  };

  const movieComedy = {
    externalId: 'tt0114709',
    title: 'Toy Story',
    genres: ['Animation', 'Comedy', 'Family'],
    rating: 8.3,
    popularity: 1100000,
  };

  // 1. Mood mapping & position-weighted genre overlap
  test('1. Mood mapping overlap: higher score for primary genre match', () => {
    // Happy mood mapped genres: ['Comedy', 'Family', 'Adventure', 'Feel-Good']
    const score1 = calculateMoodGenreScore(['Comedy'], ['Comedy', 'Family', 'Adventure', 'Feel-Good']);
    const score2 = calculateMoodGenreScore(['Adventure'], ['Comedy', 'Family', 'Adventure', 'Feel-Good']);
    assert.ok(score1 > score2, 'Primary genre (Comedy) should score higher than 3rd genre (Adventure)');
  });

  // 2. Rating normalization
  test('2. Rating normalization: 9.0 gives 0.9, 5.0 gives 0.5', () => {
    assert.equal(calculateRatingScore(9.0), 0.9);
    assert.equal(calculateRatingScore(5.0), 0.5);
    assert.equal(calculateRatingScore(10.0), 1.0);
  });

  // 3. Missing rating gets neutral default (6.5/10), NOT zero
  test('3. Missing or null rating gets neutral default (0.65), not 0', () => {
    const nullScore = calculateRatingScore(null);
    const undefScore = calculateRatingScore(undefined);
    assert.equal(nullScore, 0.65);
    assert.equal(undefScore, 0.65);
    assert.ok(nullScore > 0, 'Null rating must never result in 0');
  });

  // 4. Popularity log scaling
  test('4. Popularity log scaling increases monotonically', () => {
    const maxLog = Math.log10(1 + 1000000);
    const scoreLow = calculatePopularityScore(100, maxLog);
    const scoreHigh = calculatePopularityScore(500000, maxLog);
    assert.ok(scoreHigh > scoreLow);
    assert.ok(scoreHigh <= 1.0);
  });

  // 5. Personalization boost from user preference
  test('5. Personalization boost: user preferred genres increase total score', () => {
    const contextAnon = {
      targetGenres: ['Action', 'Adventure', 'Sci-Fi'],
      maxLogPop: 7,
      userPreferredGenres: [],
    };
    const contextUser = {
      targetGenres: ['Action', 'Adventure', 'Sci-Fi'],
      maxLogPop: 7,
      userPreferredGenres: ['Sci-Fi', 'Action'],
    };

    const resAnon = calculateHybridScore(movieInception, contextAnon);
    const resUser = calculateHybridScore(movieInception, contextUser);

    assert.ok(
      resUser.matchScore > resAnon.matchScore,
      'User preference overlap must boost overall match score'
    );
  });

  // 6. Penalty for movies already in watchlist / favorites
  test('6. Saved movies penalty: reduces score slightly to prioritize discovery', () => {
    const contextNormal = {
      targetGenres: ['Action', 'Adventure'],
      maxLogPop: 7,
      watchlistIds: [],
    };
    const contextSaved = {
      targetGenres: ['Action', 'Adventure'],
      maxLogPop: 7,
      watchlistIds: ['tt1375666'],
    };

    const normal = calculateHybridScore(movieInception, contextNormal);
    const saved = calculateHybridScore(movieInception, contextSaved);

    assert.equal(saved.inWatchlist, true);
    assert.ok(saved.matchScore <= normal.matchScore);
  });

  // 7. Custom weights respected
  test('7. Custom weights configuration respected', () => {
    const context = {
      targetGenres: ['Action'],
      weights: { moodGenreMatch: 70, rating: 10, popularity: 10, userPreference: 10 },
    };
    const res = calculateHybridScore(movieInception, context);
    assert.ok(res.matchScore > 0);
  });
});

describe('Explainable Reason Builder Unit Tests', () => {
  // 8. Reason truthfulness - only mentions genres actually present
  test('8. Reason truthfulness: only mentions genres present on movie', () => {
    const reason = buildRecommendationReason({
      movie: { title: 'Toy Story', genres: ['Animation', 'Comedy'], rating: 8.3 },
      mood: 'Happy',
      targetGenres: ['Comedy', 'Family', 'Adventure'],
    });

    assert.ok(reason.includes('Comedy'));
    assert.ok(!reason.includes('Adventure'), 'Must NOT mention Adventure since movie does not have it');
    assert.ok(!reason.includes('Family'), 'Must NOT mention Family since movie does not have it');
    assert.ok(reason.includes('rated 8.3'));
    assert.ok(reason.includes('Happy'));
  });

  // 9. Does not mention rating when rating is null or missing
  test('9. Does not mention rating when rating is missing/null', () => {
    const reason = buildRecommendationReason({
      movie: { title: 'Indie Film', genres: ['Drama'], rating: null },
      mood: 'Sad',
      targetGenres: ['Drama', 'Inspirational'],
    });

    assert.ok(!reason.includes('rated null'));
    assert.ok(!reason.includes('rated'));
    assert.ok(reason.includes('Matches Drama'));
    assert.ok(reason.includes('Sad'));
  });

  // 10. Format genre list grammar
  test('10. Genre list formatting joins with correct grammar', () => {
    assert.equal(formatGenreList(['Comedy']), 'Comedy');
    assert.equal(formatGenreList(['Comedy', 'Drama']), 'Comedy and Drama');
    assert.equal(formatGenreList(['Comedy', 'Drama', 'Family']), 'Comedy, Drama and Family');
  });
});

describe('Sentiment Analyzer Unit Tests', () => {
  // 11. High rating with positive keywords
  test('11. 5-star rating with positive keywords classifies as positive', () => {
    const sentiment = analyzeSentiment(5, 'An absolute masterpiece, loved every second!');
    assert.equal(sentiment, 'positive');
  });

  // 12. Low rating with negative keywords
  test('12. 1-star rating with negative keywords classifies as negative', () => {
    const sentiment = analyzeSentiment(1, 'Terrible, boring waste of time. Completely awful.');
    assert.equal(sentiment, 'negative');
  });

  // 13. Neutral 3-star review with balanced/no strong keywords
  test('13. 3-star rating with balanced tone classifies as neutral', () => {
    const sentiment = analyzeSentiment(3, 'It was okay, decent cinematography and average pacing.');
    assert.equal(sentiment, 'neutral');
  });
});

describe('Recommendation Service Integration Unit Tests', () => {
  const candidatePool = [
    { externalId: 'm1', title: 'Action Film', genres: ['Action', 'Thriller'], rating: 8.5, popularity: 500000 },
    { externalId: 'm2', title: 'Comedy Hit', genres: ['Comedy', 'Family'], rating: 8.0, popularity: 300000 },
    { externalId: 'm3', title: 'SciFi Epic', genres: ['Sci-Fi', 'Action'], rating: 9.0, popularity: 800000 },
    { externalId: 'm4', title: 'Obscure Drama', genres: ['Drama'], rating: 6.0, popularity: 100 },
  ];

  // 14. Sorting order: highest matchScore ranks first
  test('14. Recommendations sorted descending by matchScore', async () => {
    const result = await getRecommendations({
      mood: 'Excited',
      candidates: candidatePool,
      limit: 4,
    });

    assert.ok(result.recommendations.length > 0);
    for (let i = 0; i < result.recommendations.length - 1; i++) {
      assert.ok(
        result.recommendations[i].matchScore >= result.recommendations[i + 1].matchScore,
        'Candidates must be ordered descending by matchScore'
      );
    }
  });

  // 15. Empty candidates handling
  test('15. Empty candidate set returns empty array gracefully without crashing', async () => {
    const result = await getRecommendations({
      mood: 'Happy',
      candidates: [],
    });

    assert.deepEqual(result.recommendations, []);
    assert.equal(result.total, 0);
  });

  // 16. Limit clamping
  test('16. Limit parameter correctly clamps output count', async () => {
    const result = await getRecommendations({
      mood: 'Angry',
      candidates: candidatePool,
      limit: 2,
    });

    assert.equal(result.recommendations.length, 2);
  });
});
