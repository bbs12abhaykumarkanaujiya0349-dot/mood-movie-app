const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Movie = require('./models/Movie');
const Review = require('./models/Review');
const MoodHistory = require('./models/MoodHistory');

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

const runB4Tests = async () => {
  console.log('\n================ STARTING STEP B4 API TEST SUITE ================');
  const results = [];

  const record = (name, passed, details = '') => {
    results.push({ name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${details ? ' - ' + details : ''}`);
  };

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for test runner.\n');

  let adminToken = null;
  let adminId = null;
  let userToken = null;
  let userId = null;
  let tempUserId = null;
  let tempUserToken = null;
  let tempMovieId = null;
  let tempReviewId = null;

  try {
    // 0. Authenticate Demo Admin and Demo User
    console.log('--- Authenticating Demo Accounts ---');
    const adminLoginRes = await makeRequest(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'admin@moodie.demo', password: 'Admin@12345' }
    );
    adminToken = adminLoginRes.body.token;
    adminId = adminLoginRes.body.user?.id;
    record(
      '0a. Login as Demo Admin (role: ADMIN)',
      adminLoginRes.status === 200 && adminLoginRes.body.user?.role === 'ADMIN',
      `status: ${adminLoginRes.status}, role: ${adminLoginRes.body.user?.role}`
    );

    const userLoginRes = await makeRequest(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'user@moodie.demo', password: 'User@12345' }
    );
    userToken = userLoginRes.body.token;
    userId = userLoginRes.body.user?.id;
    record(
      '0b. Login as Demo User (role: USER)',
      userLoginRes.status === 200 && userLoginRes.body.user?.role === 'USER',
      `status: ${userLoginRes.status}, role: ${userLoginRes.body.user?.role}`
    );

    // ========================================================
    // SECTION 1: ADMIN RBAC GUARDS
    // ========================================================
    console.log('\n--- Testing Admin RBAC Middleware Guards ---');

    // 1. Admin route without token -> 401
    const resNoAuth = await makeRequest(
      { path: '/api/admin/users', method: 'GET' }
    );
    record(
      '1. Access /api/admin/users without token (401)',
      resNoAuth.status === 401,
      `status: ${resNoAuth.status}`
    );

    // 2. Admin route with USER token -> 403 Forbidden
    const resUserAuth = await makeRequest(
      { path: '/api/admin/users', method: 'GET' },
      null,
      userToken
    );
    record(
      '2. Access /api/admin/users with USER token (403 Forbidden)',
      resUserAuth.status === 403,
      `status: ${resUserAuth.status}`
    );

    // 3. /api/admin/ping with ADMIN token -> 200
    const resPing = await makeRequest(
      { path: '/api/admin/ping', method: 'GET' },
      null,
      adminToken
    );
    record(
      '3. Admin ping endpoint (/api/admin/ping) (200)',
      resPing.status === 200 && resPing.body.success === true,
      `status: ${resPing.status}`
    );

    // ========================================================
    // SECTION 2: ADMIN USER GOVERNANCE
    // ========================================================
    console.log('\n--- Testing Admin User Governance ---');

    // 4. List all users with pagination and ensure passwordHash is excluded
    const resListUsers = await makeRequest(
      { path: '/api/admin/users?page=1&limit=5', method: 'GET' },
      null,
      adminToken
    );
    const hasPasswordHash = resListUsers.body.users?.some((u) => u.passwordHash !== undefined);
    record(
      '4. List users with pagination and exclude passwordHash',
      resListUsers.status === 200 && resListUsers.body.users?.length === 5 && !hasPasswordHash,
      `status: ${resListUsers.status}, count: ${resListUsers.body.users?.length}, passwordHash excluded: ${!hasPasswordHash}`
    );

    // 5. Search users by query
    const resSearchUsers = await makeRequest(
      { path: '/api/admin/users?search=Demo', method: 'GET' },
      null,
      adminToken
    );
    const matchesSearch = resSearchUsers.body.users?.every((u) =>
      u.name.toLowerCase().includes('demo') || u.email.toLowerCase().includes('demo')
    );
    record(
      '5. Search users by name/email',
      resSearchUsers.status === 200 && matchesSearch && resSearchUsers.body.users?.length >= 2,
      `status: ${resSearchUsers.status}, matched count: ${resSearchUsers.body.users?.length}`
    );

    // 6. Filter users by role
    const resFilterRole = await makeRequest(
      { path: '/api/admin/users?role=ADMIN', method: 'GET' },
      null,
      adminToken
    );
    const allAdmin = resFilterRole.body.users?.every((u) => u.role === 'ADMIN');
    record(
      '6. Filter users by role (role=ADMIN)',
      resFilterRole.status === 200 && allAdmin,
      `status: ${resFilterRole.status}, count: ${resFilterRole.body.users?.length}`
    );

    // 7. Get user details by ID
    const resUserById = await makeRequest(
      { path: `/api/admin/users/${userId}`, method: 'GET' },
      null,
      adminToken
    );
    record(
      '7. Get user details by ID (GET /api/admin/users/:id)',
      resUserById.status === 200 && resUserById.body.user?.email === 'user@moodie.demo',
      `status: ${resUserById.status}, email: ${resUserById.body.user?.email}`
    );

    // Register a temporary test user for blocking, token invalidation, and deletion tests
    const ts = Date.now();
    const tempUserEmail = `temp_b4_${ts}@example.com`;
    const regTempRes = await makeRequest(
      { path: '/api/auth/register', method: 'POST' },
      { name: 'Temp B4 User', email: tempUserEmail, password: 'Password123!' }
    );
    tempUserId = regTempRes.body.user?.id || regTempRes.body.user?._id;
    tempUserToken = regTempRes.body.token;

    // 8. Block user: PATCH /api/admin/users/:id/status
    const resBlock = await makeRequest(
      { path: `/api/admin/users/${tempUserId}/status`, method: 'PATCH' },
      { status: 'blocked' },
      adminToken
    );
    record(
      '8. Block user status (PATCH /api/admin/users/:id/status)',
      resBlock.status === 200 && resBlock.body.user?.status === 'blocked',
      `status: ${resBlock.status}, new status: ${resBlock.body.user?.status}`
    );

    // 9. Blocked user cannot log in (403)
    const resBlockedLogin = await makeRequest(
      { path: '/api/auth/login', method: 'POST' },
      { email: tempUserEmail, password: 'Password123!' }
    );
    record(
      '9. Blocked user login rejected (403)',
      resBlockedLogin.status === 403,
      `status: ${resBlockedLogin.status}, message: "${resBlockedLogin.body.message}"`
    );

    // 10. Blocked user existing token immediately rejected (403)
    const resBlockedToken = await makeRequest(
      { path: '/api/auth/me', method: 'GET' },
      null,
      tempUserToken
    );
    record(
      '10. Blocked user existing token immediately rejected (403)',
      resBlockedToken.status === 403,
      `status: ${resBlockedToken.status}, message: "${resBlockedToken.body.message}"`
    );

    // 11. Unblock user
    const resUnblock = await makeRequest(
      { path: `/api/admin/users/${tempUserId}/status`, method: 'PATCH' },
      { status: 'active' },
      adminToken
    );
    record(
      '11. Unblock user status (PATCH /api/admin/users/:id/status)',
      resUnblock.status === 200 && resUnblock.body.user?.status === 'active',
      `status: ${resUnblock.status}, new status: ${resUnblock.body.user?.status}`
    );

    // 12. Self-block prevention: Admin cannot block themselves (400)
    const resSelfBlock = await makeRequest(
      { path: `/api/admin/users/${adminId}/status`, method: 'PATCH' },
      { status: 'blocked' },
      adminToken
    );
    record(
      '12. Self-block prevention (Admin cannot block self) (400)',
      resSelfBlock.status === 400,
      `status: ${resSelfBlock.status}, message: "${resSelfBlock.body.message}"`
    );

    // 13. Self-demote prevention: Admin cannot demote self (400)
    const resSelfDemote = await makeRequest(
      { path: `/api/admin/users/${adminId}/role`, method: 'PATCH' },
      { role: 'USER' },
      adminToken
    );
    record(
      '13. Self-demote prevention (Admin cannot demote self) (400)',
      resSelfDemote.status === 400,
      `status: ${resSelfDemote.status}, message: "${resSelfDemote.body.message}"`
    );

    // 14. Last remaining admin protection against deletion
    // Create another temporary admin to test safe deletion and last admin protection
    const secondAdmin = await User.create({
      name: 'Temp Second Admin',
      email: `admin2_${ts}@example.com`,
      passwordHash: 'dummy',
      role: 'ADMIN',
      status: 'active',
    });

    const resPromote = await makeRequest(
      { path: `/api/admin/users/${tempUserId}/role`, method: 'PATCH' },
      { role: 'ADMIN' },
      adminToken
    );
    record(
      '14a. Promote user to ADMIN (PATCH /api/admin/users/:id/role)',
      resPromote.status === 200 && resPromote.body.user?.role === 'ADMIN',
      `status: ${resPromote.status}`
    );

    // Demote temp user back to USER
    await makeRequest(
      { path: `/api/admin/users/${tempUserId}/role`, method: 'PATCH' },
      { role: 'USER' },
      adminToken
    );
    // Delete second admin
    await User.findByIdAndDelete(secondAdmin._id);

    // Now try to delete the only remaining admin (adminId) -> rejected by self-delete check
    const resDeleteLastAdmin = await makeRequest(
      { path: `/api/admin/users/${adminId}`, method: 'DELETE' },
      null,
      adminToken
    );
    record(
      '14b. Self/Last Admin deletion protection (400)',
      resDeleteLastAdmin.status === 400,
      `status: ${resDeleteLastAdmin.status}, message: "${resDeleteLastAdmin.body.message}"`
    );

    // 15. Delete user with cascade cleanup
    // Create a review and mood history for tempUser first
    const anyMovie = await Movie.findOne();
    await Review.create({
      userId: tempUserId,
      movieId: anyMovie._id,
      rating: 4,
      comment: 'Review to be deleted with user',
      sentiment: 'positive',
    });
    await MoodHistory.create({
      userId: tempUserId,
      inputText: 'History to be deleted with user',
      detectedMood: 'Happy',
    });

    const resDeleteUser = await makeRequest(
      { path: `/api/admin/users/${tempUserId}`, method: 'DELETE' },
      null,
      adminToken
    );
    const tempUserStillInDb = await User.findById(tempUserId);
    const tempUserReviews = await Review.countDocuments({ userId: tempUserId });
    const tempUserHistory = await MoodHistory.countDocuments({ userId: tempUserId });

    const cascadeSuccess =
      resDeleteUser.status === 200 &&
      !tempUserStillInDb &&
      tempUserReviews === 0 &&
      tempUserHistory === 0;

    record(
      '15. Delete user with cascade cleanup of reviews and history',
      cascadeSuccess,
      `status: ${resDeleteUser.status}, user in DB: ${Boolean(tempUserStillInDb)}, orphaned reviews: ${tempUserReviews}, orphaned history: ${tempUserHistory}`
    );

    // ========================================================
    // SECTION 3: ADMIN REVIEWS MODERATION
    // ========================================================
    console.log('\n--- Testing Admin Reviews Moderation ---');

    // 16. List reviews with population of user and movie
    const resListReviews = await makeRequest(
      { path: '/api/admin/reviews?limit=5', method: 'GET' },
      null,
      adminToken
    );
    const hasPopulatedUser = resListReviews.body.reviews?.some((r) => r.userId?.name && r.userId?.email);
    const hasPopulatedMovie = resListReviews.body.reviews?.some((r) => r.movieId?.title);
    record(
      '16. List reviews with populated user (name/email) and movie (title)',
      resListReviews.status === 200 && hasPopulatedUser && hasPopulatedMovie,
      `status: ${resListReviews.status}, count: ${resListReviews.body.reviews?.length}`
    );

    // 17. Search reviews by comment keyword
    const resSearchReview = await makeRequest(
      { path: '/api/admin/reviews?search=masterpiece', method: 'GET' },
      null,
      adminToken
    );
    record(
      '17. Search reviews by comment text',
      resSearchReview.status === 200 && resSearchReview.body.reviews?.length >= 1,
      `status: ${resSearchReview.status}, count: ${resSearchReview.body.reviews?.length}`
    );

    // 18. Filter reviews by sentiment
    const resFilterSentiment = await makeRequest(
      { path: '/api/admin/reviews?sentiment=negative', method: 'GET' },
      null,
      adminToken
    );
    const allNegative = resFilterSentiment.body.reviews?.every((r) => r.sentiment === 'negative');
    record(
      '18. Filter reviews by sentiment (sentiment=negative)',
      resFilterSentiment.status === 200 && allNegative,
      `status: ${resFilterSentiment.status}, count: ${resFilterSentiment.body.reviews?.length}`
    );

    // 19. Hide review: PATCH /api/admin/reviews/:id/status
    const targetReview = resListReviews.body.reviews?.[0];
    const resHideReview = await makeRequest(
      { path: `/api/admin/reviews/${targetReview._id}/status`, method: 'PATCH' },
      { status: 'hidden' },
      adminToken
    );
    record(
      '19. Moderate review status to "hidden" (PATCH /api/admin/reviews/:id/status)',
      resHideReview.status === 200 && resHideReview.body.review?.status === 'hidden',
      `status: ${resHideReview.status}, status: ${resHideReview.body.review?.status}`
    );

    // 20. Restore review: PATCH /api/admin/reviews/:id/status -> visible
    const resRestoreReview = await makeRequest(
      { path: `/api/admin/reviews/${targetReview._id}/status`, method: 'PATCH' },
      { status: 'visible' },
      adminToken
    );
    record(
      '20. Restore review status to "visible"',
      resRestoreReview.status === 200 && resRestoreReview.body.review?.status === 'visible',
      `status: ${resRestoreReview.status}`
    );

    // 21. Delete review by admin
    const tempRev = await Review.create({
      userId,
      movieId: anyMovie._id,
      rating: 3,
      comment: 'Review for admin delete test',
      sentiment: 'neutral',
    });
    tempReviewId = tempRev._id;

    const resDelReview = await makeRequest(
      { path: `/api/admin/reviews/${tempReviewId}`, method: 'DELETE' },
      null,
      adminToken
    );
    const reviewStillInDb = await Review.findById(tempReviewId);
    record(
      '21. Permanently delete review by admin (DELETE /api/admin/reviews/:id)',
      resDelReview.status === 200 && !reviewStillInDb,
      `status: ${resDelReview.status}, found in DB: ${Boolean(reviewStillInDb)}`
    );

    // ========================================================
    // SECTION 4: ADMIN MOVIE CATALOG MANAGEMENT
    // ========================================================
    console.log('\n--- Testing Admin Movie Catalog Management ---');

    // 22. List admin movies with pagination
    const resListMovies = await makeRequest(
      { path: '/api/admin/movies?page=1&limit=5', method: 'GET' },
      null,
      adminToken
    );
    record(
      '22. List catalog movies with pagination (GET /api/admin/movies)',
      resListMovies.status === 200 && resListMovies.body.movies?.length === 5,
      `status: ${resListMovies.status}, total: ${resListMovies.body.total}`
    );

    // 23. Manually create movie (source: "local")
    const resCreateMovie = await makeRequest(
      { path: '/api/admin/movies', method: 'POST' },
      {
        title: 'B4 Test Sci-Fi Odyssey',
        genres: ['Sci-Fi', 'Adventure'],
        releaseDate: '2026-10-20',
        overview: 'An epic journey across the cosmos test universe.',
        rating: 8.5,
        runtime: 135,
        director: 'Dr. Stella Vance',
        cast: ['John Astronaut', 'Jane Navigator'],
      },
      adminToken
    );
    tempMovieId = resCreateMovie.body.movie?._id;
    record(
      '23. Manually create movie (POST /api/admin/movies)',
      resCreateMovie.status === 201 && resCreateMovie.body.movie?.source === 'local',
      `status: ${resCreateMovie.status}, source: ${resCreateMovie.body.movie?.source}, title: "${resCreateMovie.body.movie?.title}"`
    );

    // 24. Update movie metadata
    const resUpdateMovie = await makeRequest(
      { path: `/api/admin/movies/${tempMovieId}`, method: 'PATCH' },
      {
        title: 'B4 Test Sci-Fi Odyssey (Updated Director Cut)',
        rating: 9.0,
      },
      adminToken
    );
    record(
      '24. Update movie metadata (PATCH /api/admin/movies/:id)',
      resUpdateMovie.status === 200 && resUpdateMovie.body.movie?.rating === 9.0,
      `status: ${resUpdateMovie.status}, new rating: ${resUpdateMovie.body.movie?.rating}`
    );

    // 25. Delete movie with cascade cleanup (watchlist, favorites, reviews)
    // Add temp movie to demo user's watchlist and favorites, and create a review
    await User.findByIdAndUpdate(userId, {
      $addToSet: { watchlist: tempMovieId, favoriteMovies: tempMovieId },
    });
    await Review.create({
      userId,
      movieId: tempMovieId,
      rating: 5,
      comment: 'Review attached to movie to test cascade delete',
      sentiment: 'positive',
    });

    const resDeleteMovie = await makeRequest(
      { path: `/api/admin/movies/${tempMovieId}`, method: 'DELETE' },
      null,
      adminToken
    );

    const movieStillInDb = await Movie.findById(tempMovieId);
    const updatedUser = await User.findById(userId);
    const movieInWatchlist = updatedUser.watchlist.some((id) => id.toString() === tempMovieId.toString());
    const movieInFavorites = updatedUser.favoriteMovies.some((id) => id.toString() === tempMovieId.toString());
    const orphanedReviews = await Review.countDocuments({ movieId: tempMovieId });

    const movieCascadeSuccess =
      resDeleteMovie.status === 200 &&
      !movieStillInDb &&
      !movieInWatchlist &&
      !movieInFavorites &&
      orphanedReviews === 0;

    record(
      '25. Delete movie with cascade removal from watchlist, favorites, and reviews',
      movieCascadeSuccess,
      `status: ${resDeleteMovie.status}, in watchlist: ${movieInWatchlist}, in favorites: ${movieInFavorites}, reviews: ${orphanedReviews}`
    );

    // ========================================================
    // SECTION 5: ANALYTICS & TELEMETRY
    // ========================================================
    console.log('\n--- Testing Analytics & Aggregation Pipelines ---');

    // 26. Analytics Overview
    const resOverview = await makeRequest(
      { path: '/api/admin/analytics/overview', method: 'GET' },
      null,
      adminToken
    );
    const overviewValid =
      resOverview.status === 200 &&
      typeof resOverview.body.totalUsers === 'number' &&
      typeof resOverview.body.totalMovies === 'number' &&
      typeof resOverview.body.totalReviews === 'number' &&
      typeof resOverview.body.totalRecommendations === 'number' &&
      typeof resOverview.body.activeUsers === 'number' &&
      typeof resOverview.body.popularMood === 'string';

    record(
      '26. Analytics overview (GET /api/admin/analytics/overview)',
      overviewValid,
      `status: ${resOverview.status}, users: ${resOverview.body.totalUsers}, movies: ${resOverview.body.totalMovies}, recs: ${resOverview.body.totalRecommendations}, popularMood: "${resOverview.body.popularMood}"`
    );

    // 27. Charts for 7d (Check continuous date buckets)
    const resCharts7d = await makeRequest(
      { path: '/api/admin/analytics/charts?range=7d', method: 'GET' },
      null,
      adminToken
    );
    const charts7dValid =
      resCharts7d.status === 200 &&
      resCharts7d.body.userGrowth?.length === 7 &&
      resCharts7d.body.userActivity?.length === 7 &&
      Array.isArray(resCharts7d.body.moodDistribution) &&
      Array.isArray(resCharts7d.body.popularGenres) &&
      Array.isArray(resCharts7d.body.sentimentBreakdown);

    record(
      '27. Time-series charts for 7d range (continuous date buckets without gaps)',
      charts7dValid,
      `status: ${resCharts7d.status}, userGrowth days: ${resCharts7d.body.userGrowth?.length}, activity days: ${resCharts7d.body.userActivity?.length}`
    );

    // 28. Charts for 30d
    const resCharts30d = await makeRequest(
      { path: '/api/admin/analytics/charts?range=30d', method: 'GET' },
      null,
      adminToken
    );
    record(
      '28. Time-series charts for 30d range',
      resCharts30d.status === 200 && resCharts30d.body.userGrowth?.length === 30,
      `status: ${resCharts30d.status}, days: ${resCharts30d.body.userGrowth?.length}`
    );

    // 29. Charts for 90d
    const resCharts90d = await makeRequest(
      { path: '/api/admin/analytics/charts?range=90d', method: 'GET' },
      null,
      adminToken
    );
    record(
      '29. Time-series charts for 90d range',
      resCharts90d.status === 200 && resCharts90d.body.userGrowth?.length === 90,
      `status: ${resCharts90d.status}, days: ${resCharts90d.body.userGrowth?.length}`
    );

    // 30. Invalid range validation (400)
    const resInvalidRange = await makeRequest(
      { path: '/api/admin/analytics/charts?range=14d', method: 'GET' },
      null,
      adminToken
    );
    record(
      '30. Invalid range validation (400 Bad Request)',
      resInvalidRange.status === 400,
      `status: ${resInvalidRange.status}, message: "${resInvalidRange.body.message}"`
    );
  } finally {
    // Teardown any dangling test records
    if (tempUserId) {
      await User.findByIdAndDelete(tempUserId);
      await Review.deleteMany({ userId: tempUserId });
      await MoodHistory.deleteMany({ userId: tempUserId });
    }
    if (tempMovieId) {
      await Movie.findByIdAndDelete(tempMovieId);
      await Review.deleteMany({ movieId: tempMovieId });
    }
    await mongoose.disconnect();
    console.log('Cleaned up temporary test artifacts and disconnected from MongoDB.\n');
  }

  console.log('================ STEP B4 API TEST SUITE COMPLETED ================');
  const allPassed = results.every((r) => r.passed);
  console.log(
    `Summary: ${results.filter((r) => r.passed).length}/${results.length} tests passed.\n`
  );
  if (!allPassed) {
    process.exit(1);
  }
};

runB4Tests().catch((err) => {
  console.error('Fatal error running B4 tests:', err);
  process.exit(1);
});
