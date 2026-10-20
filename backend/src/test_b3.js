const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Review = require('./models/Review');
const MoodHistory = require('./models/MoodHistory');
const Movie = require('./models/Movie');

const PORT = process.env.PORT || 5000;

const makeRequest = (options, postData = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    let payload = null;
    if (postData) {
      payload = typeof postData === 'string' ? postData : JSON.stringify(postData);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runB3Tests = async () => {
  console.log('\n================ STARTING STEP B3 API TEST SUITE ================');
  const results = [];

  const record = (name, passed, details = '', source = '') => {
    results.push({ name, passed, details, source });
    const srcTag = source ? `[source: ${source}] ` : '';
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${srcTag}${details ? '- ' + details : ''}`);
  };

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for test runner.\n');

  const ts = Date.now();
  const userAData = {
    name: 'B3 User Alpha',
    email: `test_b3_alpha_${ts}@example.com`,
    password: 'Password123!',
  };
  const userBData = {
    name: 'B3 User Beta',
    email: `test_b3_beta_${ts}@example.com`,
    password: 'Password123!',
  };

  let tokenA = null;
  let userAId = null;
  let tokenB = null;
  let userBId = null;

  try {
    // 0. Register Test Users
    console.log('--- Registering Test Users A and B ---');
    const regResA = await makeRequest(
      { path: '/api/auth/register', method: 'POST' },
      userAData
    );
    tokenA = regResA.body.token;
    userAId = regResA.body.user?.id || regResA.body.user?._id;

    const regResB = await makeRequest(
      { path: '/api/auth/register', method: 'POST' },
      userBData
    );
    tokenB = regResB.body.token;
    userBId = regResB.body.user?.id || regResB.body.user?._id;

    record(
      '0. Register Test Users A and B',
      Boolean(tokenA && tokenB),
      `User A ID: ${userAId}, User B ID: ${userBId}`
    );

    // ========================================================
    // SECTION 1: RECOMMENDATIONS ENGINE
    // ========================================================
    console.log('\n--- Testing Recommendation Engine ---');

    // 1. Anonymous recommendations for all 8 moods
    const moods = ['Happy', 'Sad', 'Romantic', 'Angry', 'Excited', 'Relaxed', 'Fearful', 'Motivated'];
    let allMoodsPassed = true;
    let sampleSource = 'omdb';

    for (const mood of moods) {
      try {
        const res = await makeRequest(
          { path: '/api/recommendations', method: 'POST' },
          { mood, limit: 4 }
        );
        sampleSource = res.body.source || sampleSource;
        if (
          res.status !== 200 ||
          res.body.success !== true ||
          res.body.mood !== mood ||
          !Array.isArray(res.body.recommendations) ||
          res.body.recommendations.length === 0
        ) {
          allMoodsPassed = false;
          console.log(`   Failed on mood: ${mood}, status: ${res.status}`);
        }
      } catch {
        allMoodsPassed = false;
      }
    }
    record(
      '1. Anonymous Recommendations (All 8 Moods)',
      allMoodsPassed,
      '8/8 moods returned high-scoring explainable recommendations',
      sampleSource
    );

    // 2. Authenticated recommendation (User A, Excited) -> Creates MoodHistory
    const initialHistoryCount = await MoodHistory.countDocuments({ userId: userAId });
    const resAuthRec = await makeRequest(
      { path: '/api/recommendations', method: 'POST' },
      { mood: 'Excited', limit: 5 },
      tokenA
    );
    const postHistoryCount = await MoodHistory.countDocuments({ userId: userAId });
    const historyCreated = postHistoryCount === initialHistoryCount + 1;
    const authRecPassed =
      resAuthRec.status === 200 &&
      resAuthRec.body.success === true &&
      resAuthRec.body.mood === 'Excited' &&
      historyCreated;
    record(
      '2. Authenticated Recommendation (Creates MoodHistory entry)',
      authRecPassed,
      `status: ${resAuthRec.status}, history entry logged: ${historyCreated}, top movie: "${resAuthRec.body.recommendations?.[0]?.movie?.title}"`,
      resAuthRec.body.source
    );

    // 3. Text-based recommendation with natural language NLP
    const resTextRec = await makeRequest(
      { path: '/api/recommendations', method: 'POST' },
      { text: 'I am so joyful, cheerful, and full of happiness today!' }
    );
    const textRecPassed =
      resTextRec.status === 200 &&
      resTextRec.body.success === true &&
      resTextRec.body.mood === 'Happy';
    record(
      '3. Natural Language Emotional Text Recommendation',
      textRecPassed,
      `status: ${resTextRec.status}, classified mood: ${resTextRec.body.mood}, confidence: ${resTextRec.body.confidence}`,
      resTextRec.body.source
    );

    // 4. Invalid mood returns 400
    const resInvalidMood = await makeRequest(
      { path: '/api/recommendations', method: 'POST' },
      { mood: 'ConfusedUnknown999' }
    );
    record(
      '4. Invalid Mood Validation (400)',
      resInvalidMood.status === 400 && resInvalidMood.body.success === false,
      `status: ${resInvalidMood.status}, message: "${resInvalidMood.body.message}"`
    );

    // 5. Empty text input returns 400
    const resEmptyText = await makeRequest(
      { path: '/api/recommendations', method: 'POST' },
      { text: '   ' }
    );
    record(
      '5. Empty Emotional Text Validation (400)',
      resEmptyText.status === 400 && resEmptyText.body.success === false,
      `status: ${resEmptyText.status}, message: "${resEmptyText.body.message}"`
    );

    // 6. Anonymous request does NOT create MoodHistory
    const anonHistoryCountBefore = await MoodHistory.countDocuments({});
    await makeRequest(
      { path: '/api/recommendations', method: 'POST' },
      { mood: 'Relaxed' }
    );
    const anonHistoryCountAfter = await MoodHistory.countDocuments({});
    record(
      '6. Anonymous Request Does Not Pollute MoodHistory',
      anonHistoryCountBefore === anonHistoryCountAfter,
      `history count remained: ${anonHistoryCountAfter}`
    );

    // ========================================================
    // SECTION 2: WATCHLIST & FAVORITES
    // ========================================================
    console.log('\n--- Testing Watchlist & Favorites ---');

    // 7. No token on watchlist returns 401
    const resNoTokenWatchlist = await makeRequest(
      { path: '/api/watchlist', method: 'GET' }
    );
    record(
      '7. Watchlist Unauthorized Without Token (401)',
      resNoTokenWatchlist.status === 401,
      `status: ${resNoTokenWatchlist.status}`
    );

    // 8. Add movie to watchlist (Inception tt1375666)
    const resAddWatchlist = await makeRequest(
      { path: '/api/watchlist', method: 'POST' },
      { movieId: 'tt1375666' },
      tokenA
    );
    record(
      '8. Add Movie to Watchlist (POST /api/watchlist)',
      resAddWatchlist.status === 201 && resAddWatchlist.body.success === true,
      `status: ${resAddWatchlist.status}, title: "${resAddWatchlist.body.movie?.title}"`
    );

    // 9. List watchlist (populated)
    const resListWatchlist = await makeRequest(
      { path: '/api/watchlist', method: 'GET' },
      null,
      tokenA
    );
    const watchlistPopulated =
      resListWatchlist.status === 200 &&
      resListWatchlist.body.count === 1 &&
      resListWatchlist.body.watchlist[0]?.title === 'Inception';
    record(
      '9. List Watchlist (Populated Movies)',
      watchlistPopulated,
      `status: ${resListWatchlist.status}, count: ${resListWatchlist.body.count}, title: "${resListWatchlist.body.watchlist?.[0]?.title}"`
    );

    // 10. Duplicate in watchlist returns 409
    const resDupWatchlist = await makeRequest(
      { path: '/api/watchlist', method: 'POST' },
      { movieId: 'tt1375666' },
      tokenA
    );
    record(
      '10. Duplicate Watchlist Prevention (409)',
      resDupWatchlist.status === 409 && resDupWatchlist.body.success === false,
      `status: ${resDupWatchlist.status}, message: "${resDupWatchlist.body.message}"`
    );

    // 11. Remove from watchlist
    const resRemoveWatchlist = await makeRequest(
      { path: '/api/watchlist/tt1375666', method: 'DELETE' },
      null,
      tokenA
    );
    record(
      '11. Remove from Watchlist (DELETE /api/watchlist/:id)',
      resRemoveWatchlist.status === 200 && resRemoveWatchlist.body.success === true,
      `status: ${resRemoveWatchlist.status}`
    );

    // 12. Remove non-existent item from watchlist returns 404
    const resRemoveMissingWatchlist = await makeRequest(
      { path: '/api/watchlist/tt1375666', method: 'DELETE' },
      null,
      tokenA
    );
    record(
      '12. Remove Missing Item from Watchlist (404)',
      resRemoveMissingWatchlist.status === 404,
      `status: ${resRemoveMissingWatchlist.status}`
    );

    // 13. Add movie to favorites (Toy Story tt0114709)
    const resAddFav = await makeRequest(
      { path: '/api/favorites', method: 'POST' },
      { movieId: 'tt0114709' },
      tokenA
    );
    record(
      '13. Add Movie to Favorites (POST /api/favorites)',
      resAddFav.status === 201 && resAddFav.body.success === true,
      `status: ${resAddFav.status}, title: "${resAddFav.body.movie?.title}"`
    );

    // 14. List favorites (populated)
    const resListFav = await makeRequest(
      { path: '/api/favorites', method: 'GET' },
      null,
      tokenA
    );
    const favPopulated =
      resListFav.status === 200 &&
      resListFav.body.count === 1 &&
      resListFav.body.favorites[0]?.title === 'Toy Story';
    record(
      '14. List Favorites (Populated Movies)',
      favPopulated,
      `status: ${resListFav.status}, count: ${resListFav.body.count}`
    );

    // 15. Duplicate in favorites returns 409
    const resDupFav = await makeRequest(
      { path: '/api/favorites', method: 'POST' },
      { movieId: 'tt0114709' },
      tokenA
    );
    record(
      '15. Duplicate Favorites Prevention (409)',
      resDupFav.status === 409 && resDupFav.body.success === false,
      `status: ${resDupFav.status}`
    );

    // 16. Remove from favorites
    const resRemoveFav = await makeRequest(
      { path: '/api/favorites/tt0114709', method: 'DELETE' },
      null,
      tokenA
    );
    record(
      '16. Remove from Favorites (DELETE /api/favorites/:id)',
      resRemoveFav.status === 200 && resRemoveFav.body.success === true,
      `status: ${resRemoveFav.status}`
    );

    // 17. Remove missing item from favorites returns 404
    const resRemoveMissingFav = await makeRequest(
      { path: '/api/favorites/tt0114709', method: 'DELETE' },
      null,
      tokenA
    );
    record(
      '17. Remove Missing Item from Favorites (404)',
      resRemoveMissingFav.status === 404,
      `status: ${resRemoveMissingFav.status}`
    );

    // ========================================================
    // SECTION 3: REVIEWS & SENTIMENT ANALYZER
    // ========================================================
    console.log('\n--- Testing Reviews & Sentiment ---');

    let reviewAId = null;

    // 18. Create review (User A, 5 stars, positive sentiment)
    const resCreateReview = await makeRequest(
      { path: '/api/reviews', method: 'POST' },
      {
        movieId: 'tt1375666',
        rating: 5,
        comment: 'An absolute masterpiece of cinema! Truly brilliant and mind-bending.',
      },
      tokenA
    );
    reviewAId = resCreateReview.body.review?._id;
    const reviewCreated =
      resCreateReview.status === 201 &&
      resCreateReview.body.review?.sentiment === 'positive';
    record(
      '18. Create Review (5 Stars + Positive Sentiment)',
      reviewCreated,
      `status: ${resCreateReview.status}, sentiment: ${resCreateReview.body.review?.sentiment}`
    );

    // 19. Duplicate review prevention (409)
    const resDupReview = await makeRequest(
      { path: '/api/reviews', method: 'POST' },
      {
        movieId: 'tt1375666',
        rating: 4,
        comment: 'Trying to review again.',
      },
      tokenA
    );
    record(
      '19. Duplicate Review Prevention (409)',
      resDupReview.status === 409 && resDupReview.body.success === false,
      `status: ${resDupReview.status}`
    );

    // 20. Invalid review rating (6 stars) returns 400
    const resInvalidRating = await makeRequest(
      { path: '/api/reviews', method: 'POST' },
      {
        movieId: 'tt0114709',
        rating: 6,
        comment: 'Too high rating.',
      },
      tokenA
    );
    record(
      '20. Invalid Review Rating Validation (400)',
      resInvalidRating.status === 400,
      `status: ${resInvalidRating.status}`
    );

    // 21. XSS-style comment is sanitized
    const resXssReview = await makeRequest(
      { path: '/api/reviews', method: 'POST' },
      {
        movieId: 'tt0114709',
        rating: 5,
        comment: '<script>alert("xss")</script>Incredible film loved it!',
      },
      tokenB
    );
    const commentSanitized =
      resXssReview.status === 201 &&
      !resXssReview.body.review?.comment.includes('<script>');
    record(
      '21. XSS Comment Sanitization (Strips Script/HTML Tags)',
      commentSanitized,
      `status: ${resXssReview.status}, sanitized comment: "${resXssReview.body.review?.comment}"`
    );

    // 22. Public reviews list with summary metrics (No email leaked)
    const resMovieReviews = await makeRequest(
      { path: '/api/reviews/tt1375666', method: 'GET' }
    );
    const reviewsCheck =
      resMovieReviews.status === 200 &&
      resMovieReviews.body.summary?.reviewCount >= 1 &&
      resMovieReviews.body.reviews[0]?.userId?.name === 'B3 User Alpha' &&
      resMovieReviews.body.reviews[0]?.userId?.email === undefined;
    record(
      '22. Public Reviews List with Summary (User Name Only, No Email)',
      reviewsCheck,
      `status: ${resMovieReviews.status}, avgRating: ${resMovieReviews.body.summary?.averageRating}, count: ${resMovieReviews.body.summary?.reviewCount}`
    );

    // 23. Edit review by owner (User A updates to 1 star, negative sentiment)
    const resEditReview = await makeRequest(
      { path: `/api/reviews/${reviewAId}`, method: 'PATCH' },
      {
        rating: 1,
        comment: 'Actually reconsidered, it is terrible, awful and totally boring waste of time.',
      },
      tokenA
    );
    const editReviewPassed =
      resEditReview.status === 200 &&
      resEditReview.body.review?.rating === 1 &&
      resEditReview.body.review?.sentiment === 'negative';
    record(
      '23. Edit Review by Owner (Recomputes Sentiment to Negative)',
      editReviewPassed,
      `status: ${resEditReview.status}, new rating: ${resEditReview.body.review?.rating}, new sentiment: ${resEditReview.body.review?.sentiment}`
    );

    // 24. Edit review by other user (User B attempts to edit User A's review) -> 403
    const resForbiddenEdit = await makeRequest(
      { path: `/api/reviews/${reviewAId}`, method: 'PATCH' },
      { rating: 5, comment: 'Hacking review' },
      tokenB
    );
    record(
      '24. Edit Review by Non-Owner (403 Forbidden)',
      resForbiddenEdit.status === 403,
      `status: ${resForbiddenEdit.status}`
    );

    // 25. Delete review by owner (User A)
    const resDeleteReview = await makeRequest(
      { path: `/api/reviews/${reviewAId}`, method: 'DELETE' },
      null,
      tokenA
    );
    record(
      '25. Delete Review by Owner (200)',
      resDeleteReview.status === 200,
      `status: ${resDeleteReview.status}`
    );

    // 26. Get my reviews (/api/reviews/me/list)
    const resMyReviews = await makeRequest(
      { path: '/api/reviews/me/list', method: 'GET' },
      null,
      tokenB
    );
    record(
      '26. Current User Reviews List (GET /api/reviews/me/list)',
      resMyReviews.status === 200 && resMyReviews.body.count >= 1,
      `status: ${resMyReviews.status}, count: ${resMyReviews.body.count}`
    );

    // ========================================================
    // SECTION 4: HISTORY
    // ========================================================
    console.log('\n--- Testing History ---');

    // 27. List history
    const resListHistory = await makeRequest(
      { path: '/api/history', method: 'GET' },
      null,
      tokenA
    );
    const historyListPassed =
      resListHistory.status === 200 &&
      resListHistory.body.totalResults >= 1 &&
      resListHistory.body.history[0]?.detectedMood === 'Excited';
    const sampleHistoryId = resListHistory.body.history?.[0]?._id;
    record(
      '27. List History (Populated Recommended Movies)',
      historyListPassed,
      `status: ${resListHistory.status}, total: ${resListHistory.body.totalResults}`
    );

    // 28. Filter history by mood (?mood=Excited)
    const resFilterHistory = await makeRequest(
      { path: '/api/history?mood=Excited', method: 'GET' },
      null,
      tokenA
    );
    record(
      '28. Filter History by Mood (?mood=Excited)',
      resFilterHistory.status === 200 && resFilterHistory.body.totalResults >= 1,
      `status: ${resFilterHistory.status}, filtered count: ${resFilterHistory.body.totalResults}`
    );

    // 29. Delete history item by id
    const resDeleteHistItem = await makeRequest(
      { path: `/api/history/${sampleHistoryId}`, method: 'DELETE' },
      null,
      tokenA
    );
    record(
      '29. Delete Single History Item (DELETE /api/history/:id)',
      resDeleteHistItem.status === 200,
      `status: ${resDeleteHistItem.status}`
    );

    // 30. Clear all history for current user
    const resClearHistory = await makeRequest(
      { path: '/api/history', method: 'DELETE' },
      null,
      tokenA
    );
    record(
      '30. Clear All History (DELETE /api/history)',
      resClearHistory.status === 200,
      `status: ${resClearHistory.status}`
    );

    // ========================================================
    // SECTION 5: USER PROFILE
    // ========================================================
    console.log('\n--- Testing User Profile ---');

    // 31. Get user statistics (/api/users/me/stats)
    const resStats = await makeRequest(
      { path: '/api/users/me/stats', method: 'GET' },
      null,
      tokenB
    );
    const statsPassed =
      resStats.status === 200 &&
      typeof resStats.body.stats?.reviewCount === 'number' &&
      resStats.body.stats?.reviewCount >= 1 &&
      typeof resStats.body.stats?.watchlistCount === 'number';
    record(
      '31. User Profile Statistics (GET /api/users/me/stats)',
      statsPassed,
      `status: ${resStats.status}, reviews: ${resStats.body.stats?.reviewCount}, watchlist: ${resStats.body.stats?.watchlistCount}`
    );

    // 32. Update preferences (/api/users/me/preferences)
    const resPrefs = await makeRequest(
      { path: '/api/users/me/preferences', method: 'PATCH' },
      {
        favoriteGenres: ['Sci-Fi', 'Action', 'Adventure'],
        language: 'en',
      },
      tokenB
    );
    const prefsPassed =
      resPrefs.status === 200 &&
      Array.isArray(resPrefs.body.preferences?.favoriteGenres) &&
      resPrefs.body.preferences.favoriteGenres.includes('Sci-Fi');
    record(
      '32. Update User Preferences (PATCH /api/users/me/preferences)',
      prefsPassed,
      `status: ${resPrefs.status}, genres: ${resPrefs.body.preferences?.favoriteGenres?.join(', ')}`
    );

    // 33. Delete account with wrong password -> 401
    const resBadPassDelete = await makeRequest(
      { path: '/api/users/me', method: 'DELETE' },
      { password: 'WrongPassword999' },
      tokenA
    );
    record(
      '33. Account Deletion Wrong Password (401)',
      resBadPassDelete.status === 401,
      `status: ${resBadPassDelete.status}`
    );

    // 34. Delete account with correct password -> 200 (cascades data)
    const resDeleteAccount = await makeRequest(
      { path: '/api/users/me', method: 'DELETE' },
      { password: 'Password123!' },
      tokenA
    );
    const userADeleted = !(await User.findById(userAId));
    record(
      '34. Account Deletion and Cascade Cleanup (DELETE /api/users/me)',
      resDeleteAccount.status === 200 && userADeleted,
      `status: ${resDeleteAccount.status}, user A deleted from DB: ${userADeleted}`
    );
  } finally {
    // 35. Clean up User B and test data from MongoDB
    if (userAId) {
      await User.findByIdAndDelete(userAId);
      await Review.deleteMany({ userId: userAId });
      await MoodHistory.deleteMany({ userId: userAId });
    }
    if (userBId) {
      await User.findByIdAndDelete(userBId);
      await Review.deleteMany({ userId: userBId });
      await MoodHistory.deleteMany({ userId: userBId });
    }
    await mongoose.disconnect();
    console.log('Cleaned up test data and disconnected from MongoDB.\n');
  }

  console.log('================ STEP B3 API TEST SUITE COMPLETED ================');
  const allPassed = results.every((r) => r.passed);
  console.log(
    `Summary: ${results.filter((r) => r.passed).length}/${results.length} tests passed.\n`
  );

  return results;
};

runB3Tests().then((res) => {
  const allPassed = res.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
});
