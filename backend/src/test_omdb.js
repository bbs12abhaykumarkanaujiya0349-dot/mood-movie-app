const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const recommendationService = require('./services/recommendationService');
const movieService = require('./services/movieService');

const makeRequest = (port, options, postData = null) => {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port,
      ...options,
    };
    const req = http.request(opts, (res) => {
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
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runOmdbTests = async () => {
  console.log('\n================ STARTING OMDB PROVIDER API TEST SUITE ================');
  const results = [];

  const record = (name, passed, details = '', source = '') => {
    results.push({ name, passed, details, source });
    const sourceTag = source ? `[source: ${source}] ` : '';
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${sourceTag}${details ? '- ' + details : ''}`);
  };

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected successfully for test server.\n');

  // Start test server on ephemeral port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const testPort = server.address().port;

  try {
    // 1. Health check
    try {
      const res = await makeRequest(testPort, { path: '/api/health', method: 'GET' });
      const passed = res.status === 200 && res.body.status === 'ok';
      record('1. Health Check', passed, `status: ${res.status}, db: ${res.body.db}`);
    } catch (e) {
      record('1. Health Check', false, e.message);
    }

    // 2. Movie Search with Title (q=Inception)
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/search?q=Inception', method: 'GET' });
      const src = res.body.source;
      const passed =
        res.status === 200 &&
        res.body.success === true &&
        src === 'omdb' &&
        Array.isArray(res.body.results) &&
        res.body.results.length > 0 &&
        res.body.results.some((m) => m.title.toLowerCase().includes('inception'));
      record(
        '2. Movie Title Search (GET /api/movies/search?q=Inception)',
        passed,
        `status: ${res.status}, matched: "${res.body.results?.[0]?.title}", count: ${res.body.results?.length}`,
        src
      );
    } catch (e) {
      record('2. Movie Title Search', false, e.message);
    }

    // 3. Movie Search without query (Filters from curated set)
    try {
      const res = await makeRequest(testPort, {
        path: '/api/movies/search?genre=Sci-Fi&minRating=8.0&sort=rating',
        method: 'GET',
      });
      const src = res.body.source;
      const passed =
        res.status === 200 &&
        res.body.success === true &&
        src === 'omdb' &&
        Array.isArray(res.body.results) &&
        res.body.results.length > 0 &&
        res.body.results.every((m) => m.rating >= 8.0);
      record(
        '3. Movie Search with Filters (genre=Sci-Fi, minRating=8.0, sort=rating)',
        passed,
        `status: ${res.status}, top movie: "${res.body.results?.[0]?.title}" (${res.body.results?.[0]?.rating})`,
        src
      );
    } catch (e) {
      record('3. Movie Search with Filters', false, e.message);
    }

    // 4. Movie Details for valid IMDb ID (tt1375666)
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/tt1375666', method: 'GET' });
      const src = res.body.source;
      const movie = res.body.movie;
      const passed =
        res.status === 200 &&
        res.body.success === true &&
        src === 'omdb' &&
        movie?.externalId === 'tt1375666' &&
        movie?.title === 'Inception' &&
        typeof movie?.rating === 'number' &&
        typeof movie?.runtime === 'number' &&
        movie?.director === 'Christopher Nolan' &&
        Array.isArray(movie?.genres) &&
        movie?.genres.length > 0;
      record(
        '4. Movie Details (GET /api/movies/tt1375666)',
        passed,
        `status: ${res.status}, title: "${movie?.title}", rating: ${movie?.rating}, runtime: ${movie?.runtime}m, director: "${movie?.director}"`,
        src
      );
    } catch (e) {
      record('4. Movie Details', false, e.message);
    }

    // 5. Trending Movies
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/trending', method: 'GET' });
      const src = res.body.source;
      const passed =
        res.status === 200 &&
        res.body.success === true &&
        src === 'omdb' &&
        Array.isArray(res.body.results) &&
        res.body.results.length > 0;
      record(
        '5. Trending Movies (GET /api/movies/trending)',
        passed,
        `status: ${res.status}, count: ${res.body.results?.length}, top: "${res.body.results?.[0]?.title}"`,
        src
      );
    } catch (e) {
      record('5. Trending Movies', false, e.message);
    }

    // 6. Popular Movies
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/popular', method: 'GET' });
      const src = res.body.source;
      const passed =
        res.status === 200 &&
        res.body.success === true &&
        src === 'omdb' &&
        Array.isArray(res.body.results) &&
        res.body.results.length > 0;
      record(
        '6. Popular Movies (GET /api/movies/popular)',
        passed,
        `status: ${res.status}, count: ${res.body.results?.length}, top: "${res.body.results?.[0]?.title}" (${res.body.results?.[0]?.rating})`,
        src
      );
    } catch (e) {
      record('6. Popular Movies', false, e.message);
    }

    // 7. Movie Genres List
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/genres', method: 'GET' });
      const src = res.body.source;
      const passed =
        res.status === 200 &&
        res.body.success === true &&
        src === 'omdb' &&
        Array.isArray(res.body.genres) &&
        res.body.genres.length >= 8;
      record(
        '7. Movie Genres List (GET /api/movies/genres)',
        passed,
        `status: ${res.status}, genres count: ${res.body.genres?.length}`,
        src
      );
    } catch (e) {
      record('7. Movie Genres List', false, e.message);
    }

    // 8. Similar Movies (GET /api/movies/tt1375666/similar)
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/tt1375666/similar', method: 'GET' });
      const src = res.body.source;
      const passed =
        res.status === 200 &&
        res.body.success === true &&
        src === 'omdb' &&
        Array.isArray(res.body.results) &&
        res.body.results.length > 0;
      record(
        '8. Similar Movies (GET /api/movies/tt1375666/similar)',
        passed,
        `status: ${res.status}, similar count: ${res.body.results?.length}, top similar: "${res.body.results?.[0]?.title}"`,
        src
      );
    } catch (e) {
      record('8. Similar Movies', false, e.message);
    }

    // 9. Invalid Movie ID (400)
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/invalid@@@id###', method: 'GET' });
      const passed = res.status === 400 && res.body.success === false;
      record(
        '9. Invalid Movie ID Format (400 validation error)',
        passed,
        `status: ${res.status}, message: ${res.body.errors?.[0]?.message || res.body.message}`
      );
    } catch (e) {
      record('9. Invalid Movie ID Format (400)', false, e.message);
    }

    // 10. Movie Not Found (404)
    try {
      const res = await makeRequest(testPort, { path: '/api/movies/tt9999999999', method: 'GET' });
      const passed = res.status === 404 && res.body.success === false;
      record(
        '10. Movie Not Found (404)',
        passed,
        `status: ${res.status}, message: "${res.body.message}"`
      );
    } catch (e) {
      record('10. Movie Not Found (404)', false, e.message);
    }

    // 11. Forced Bad Key Fallback (test only in memory, .env is NOT changed)
    console.log('\n--- Testing Forced Bad Key Fallback (In-memory test only, .env untouched) ---');
    const savedKey = process.env.OMDB_API_KEY;
    try {
      // Force an invalid key in memory
      process.env.OMDB_API_KEY = 'invalid_bad_key_test_123';

      // 11a. Search fallback to local
      const resSearch = await makeRequest(testPort, { path: '/api/movies/search?q=Inception', method: 'GET' });
      const searchPassed = resSearch.status === 200 && resSearch.body.source === 'local';
      record(
        '11a. Forced Bad Key: Search Falls Back to Local',
        searchPassed,
        `status: ${resSearch.status}, source: ${resSearch.body.source}, results: ${resSearch.body.results?.length}`,
        resSearch.body.source
      );

      // 11b. Trending fallback to local
      const resTrending = await makeRequest(testPort, { path: '/api/movies/trending', method: 'GET' });
      const trendingPassed = resTrending.status === 200 && resTrending.body.source === 'local';
      record(
        '11b. Forced Bad Key: Trending Falls Back to Local',
        trendingPassed,
        `status: ${resTrending.status}, source: ${resTrending.body.source}`,
        resTrending.body.source
      );

      // 11c. Popular fallback to local
      const resPopular = await makeRequest(testPort, { path: '/api/movies/popular', method: 'GET' });
      const popularPassed = resPopular.status === 200 && resPopular.body.source === 'local';
      record(
        '11c. Forced Bad Key: Popular Falls Back to Local',
        popularPassed,
        `status: ${resPopular.status}, source: ${resPopular.body.source}`,
        resPopular.body.source
      );

      // 11d. Genres fallback to local
      const resGenres = await makeRequest(testPort, { path: '/api/movies/genres', method: 'GET' });
      const genresPassed = resGenres.status === 200 && resGenres.body.source === 'local';
      record(
        '11d. Forced Bad Key: Genres Falls Back to Local',
        genresPassed,
        `status: ${resGenres.status}, source: ${resGenres.body.source}, count: ${resGenres.body.genres?.length}`,
        resGenres.body.source
      );

      // 11e. Similar fallback to local
      const resSimilar = await makeRequest(testPort, { path: '/api/movies/local-1/similar', method: 'GET' });
      const similarPassed = resSimilar.status === 200 && resSimilar.body.source === 'local';
      record(
        '11e. Forced Bad Key: Similar Falls Back to Local',
        similarPassed,
        `status: ${resSimilar.status}, source: ${resSimilar.body.source}`,
        resSimilar.body.source
      );
    } finally {
      // Restore valid OMDB_API_KEY in memory
      process.env.OMDB_API_KEY = savedKey;
      console.log('Restored valid OMDB_API_KEY in memory.\n');
    }

    // 12. Recommendation Service with OMDb candidates test
    try {
      const curated = await movieService.getHydratedCuratedMovies();
      const recResult = await recommendationService.recommendForMood({
        mood: 'Excited',
        candidates: curated,
        limit: 10,
      });

      const passed =
        recResult.mood === 'Excited' &&
        recResult.source === 'omdb' &&
        Array.isArray(recResult.recommendations) &&
        recResult.recommendations.length === 10 &&
        recResult.recommendations.every(
          (m) => typeof m.matchScore === 'number' && !isNaN(m.matchScore) && m.reason
        );

      record(
        '12. Recommendation Engine with OMDb Candidates (Excited Mood)',
        passed,
        `mood: ${recResult.mood}, source: ${recResult.source}, top rec: "${recResult.recommendations[0]?.title}" (matchScore: ${recResult.recommendations[0]?.matchScore}%)`,
        recResult.source
      );
    } catch (e) {
      record('12. Recommendation Engine with OMDb Candidates', false, e.message);
    }
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  console.log('\n================ OMDB PROVIDER API TEST SUITE COMPLETED ================');
  const allPassed = results.every((r) => r.passed);
  console.log(
    `Summary: ${results.filter((r) => r.passed).length}/${results.length} tests passed.\n`
  );

  return results;
};

runOmdbTests().then((res) => {
  const allPassed = res.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
});
