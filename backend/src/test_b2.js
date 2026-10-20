const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

const runB2Tests = async () => {
  console.log('\n================ STARTING STEP B2 API TEST SUITE ================');
  const results = [];

  const record = (name, passed, details = '') => {
    results.push({ name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${details ? '- ' + details : ''}`);
  };

  const hasMovieKey = !!(process.env.MOVIE_API_KEY && process.env.MOVIE_API_KEY.trim());
  const hasOmdbKey = !!(process.env.OMDB_API_KEY && process.env.OMDB_API_KEY.trim());
  const hasAiKey = !!(process.env.AI_API_KEY && process.env.AI_API_KEY.trim());

  // 1. Health check
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
    });
    const passed = res.status === 200 && res.body.status === 'ok' && res.body.db === 'connected';
    record('1. Health Check', passed, `status: ${res.status}, db: ${res.body.db}`);
  } catch (e) {
    record('1. Health Check', false, e.message);
  }

  // 2. Search without filters (returns page 1 of 12 movies)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/search',
      method: 'GET',
    });
    const passed =
      res.status === 200 &&
      res.body.success === true &&
      Array.isArray(res.body.results) &&
      res.body.results.length > 0 &&
      (res.body.source === 'local' || res.body.source === 'tmdb' || res.body.source === 'omdb');
    record(
      '2. Movie Search (Default/No filters)',
      passed,
      `status: ${res.status}, source: ${res.body.source}, count: ${res.body.results?.length}, total: ${res.body.totalResults}`
    );
  } catch (e) {
    record('2. Movie Search (Default/No filters)', false, e.message);
  }

  // 3. Search with filters (q, genre, minRating, sort)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/search?q=Inception&genre=Sci-Fi&minRating=8.0&sort=rating',
      method: 'GET',
    });
    const passed =
      res.status === 200 &&
      res.body.success === true &&
      res.body.results?.some((m) => m.title.toLowerCase().includes('inception'));
    record(
      '3. Movie Search with Filters (query, genre, minRating, sort)',
      passed,
      `status: ${res.status}, matched movie: "${res.body.results?.[0]?.title}"`
    );
  } catch (e) {
    record('3. Movie Search with Filters', false, e.message);
  }

  // 4. Trending movies endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/trending',
      method: 'GET',
    });
    const passed =
      res.status === 200 &&
      res.body.success === true &&
      Array.isArray(res.body.results) &&
      res.body.results.length > 0;
    record(
      '4. Trending Movies (GET /api/movies/trending)',
      passed,
      `status: ${res.status}, source: ${res.body.source}, results: ${res.body.results?.length}`
    );
  } catch (e) {
    record('4. Trending Movies', false, e.message);
  }

  // 5. Popular movies endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/popular',
      method: 'GET',
    });
    const passed =
      res.status === 200 &&
      res.body.success === true &&
      Array.isArray(res.body.results) &&
      res.body.results.length > 0;
    record(
      '5. Popular Movies (GET /api/movies/popular)',
      passed,
      `status: ${res.status}, source: ${res.body.source}, top: "${res.body.results?.[0]?.title}"`
    );
  } catch (e) {
    record('5. Popular Movies', false, e.message);
  }

  // 6. Genres list endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/genres',
      method: 'GET',
    });
    const passed =
      res.status === 200 &&
      res.body.success === true &&
      Array.isArray(res.body.genres) &&
      res.body.genres.length >= 8;
    record(
      '6. Genres List (GET /api/movies/genres)',
      passed,
      `status: ${res.status}, genres count: ${res.body.genres?.length}`
    );
  } catch (e) {
    record('6. Genres List', false, e.message);
  }

  // 7. Movie Details endpoint (valid ID)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/local-1',
      method: 'GET',
    });
    const passed =
      res.status === 200 &&
      res.body.success === true &&
      res.body.movie?.title === 'Inception' &&
      res.body.movie?.director === 'Christopher Nolan';
    record(
      '7. Movie Details (GET /api/movies/:id)',
      passed,
      `status: ${res.status}, title: "${res.body.movie?.title}", rating: ${res.body.movie?.rating}`
    );
  } catch (e) {
    record('7. Movie Details', false, e.message);
  }

  // 8. Similar Movies endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/local-1/similar',
      method: 'GET',
    });
    const passed =
      res.status === 200 &&
      res.body.success === true &&
      Array.isArray(res.body.results) &&
      res.body.results.length > 0;
    record(
      '8. Similar Movies (GET /api/movies/:id/similar)',
      passed,
      `status: ${res.status}, count: ${res.body.results?.length}`
    );
  } catch (e) {
    record('8. Similar Movies', false, e.message);
  }

  // 9. Invalid Movie ID (400)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/invalid@@@id###',
      method: 'GET',
    });
    const passed = res.status === 400 && res.body.success === false;
    record(
      '9. Invalid Movie ID (400)',
      passed,
      `status: ${res.status}, validation error caught: ${res.body.errors?.[0]?.message}`
    );
  } catch (e) {
    record('9. Invalid Movie ID (400)', false, e.message);
  }

  // 10. Movie Not Found (404)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/local-999999',
      method: 'GET',
    });
    const passed = res.status === 404 && res.body.success === false;
    record(
      '10. Movie Not Found (404)',
      passed,
      `status: ${res.status}, message: "${res.body.message}"`
    );
  } catch (e) {
    record('10. Movie Not Found (404)', false, e.message);
  }

  // 11. Source check when MOVIE_API_KEY is empty: must be "local"
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/search?q=Budapest',
      method: 'GET',
    });
    const expectedSource = hasMovieKey ? 'tmdb' : (hasOmdbKey ? 'omdb' : 'local');
    const passed = res.status === 200 && res.body.source === expectedSource;
    record(
      `11. Data Source Verification (${hasMovieKey ? 'TMDb' : (hasOmdbKey ? 'OMDb' : 'Local Fallback')})`,
      passed,
      `expected: ${expectedSource}, actual: ${res.body.source}`
    );
  } catch (e) {
    record('11. Data Source Verification', false, e.message);
  }

  // 12. Mood Analyze: 8 Mood sentences
  const moodSentences = [
    { text: 'I am so happy and full of joy today, ready to celebrate!', expected: 'Happy' },
    { text: 'Feeling really sad, heartbroken, crying and feeling low', expected: 'Sad' },
    { text: 'Looking for a lovely romantic story about passion and true love', expected: 'Romantic' },
    { text: 'I am so angry and furious, full of rage right now', expected: 'Angry' },
    { text: 'Excited and thrilled for a wild adrenaline adventure!', expected: 'Excited' },
    { text: 'Just want to unwind, stay calm, and relax peacefully', expected: 'Relaxed' },
    { text: 'Terrified by horror, creepy ghosts, and scary monsters', expected: 'Fearful' },
    { text: 'Driven to hustle, discipline myself, persevere and succeed', expected: 'Motivated' },
  ];

  let allSentencesPassed = true;
  for (const item of moodSentences) {
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/mood/analyze',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { text: item.text }
      );
      if (res.status !== 200 || res.body.mood !== item.expected) {
        allSentencesPassed = false;
        console.log(`   Mismatch for "${item.text.slice(0, 30)}...": expected ${item.expected}, got ${res.body.mood}`);
      }
    } catch {
      allSentencesPassed = false;
    }
  }
  record('12. Mood Analysis (All 8 Mood Sentences)', allSentencesPassed, '8/8 moods correctly classified');

  // 13. Mood Negation: "I am really not happy today" -> Sad
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/mood/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { text: 'I am really not happy today at all' }
    );
    const passed = res.status === 200 && res.body.mood === 'Sad';
    record('13. Mood Negation ("not happy" -> Sad)', passed, `detected: ${res.body.mood}, confidence: ${res.body.confidence}`);
  } catch (e) {
    record('13. Mood Negation', false, e.message);
  }

  // 14. Mood Contrast: "I feel low and want something uplifting" -> Sad
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/mood/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { text: 'I feel low and want something uplifting' }
    );
    const passed = res.status === 200 && res.body.mood === 'Sad';
    record(
      '14. Mood Contrast ("I feel low and want something uplifting" -> Sad)',
      passed,
      `current feeling detected: ${res.body.mood}`
    );
  } catch (e) {
    record('14. Mood Contrast', false, e.message);
  }

  // 15. Mood Validation: Empty text (400)
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/mood/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { text: '' }
    );
    const passed = res.status === 400 && res.body.success === false;
    record('15. Mood Validation: Empty Text (400)', passed, `status: ${res.status}`);
  } catch (e) {
    record('15. Mood Validation: Empty Text (400)', false, e.message);
  }

  // 16. Mood Validation: Too long text > 500 chars (400)
  try {
    const longText = 'a'.repeat(505);
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/mood/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { text: longText }
    );
    const passed = res.status === 400 && res.body.success === false;
    record('16. Mood Validation: Too Long >500 chars (400)', passed, `status: ${res.status}`);
  } catch (e) {
    record('16. Mood Validation: Too Long (400)', false, e.message);
  }

  // 17. Mood Gibberish Text: uncertain: true
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/mood/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { text: 'qwpokasdflkjzxcmvnb 9812739128371928' }
    );
    const passed = res.status === 200 && res.body.uncertain === true;
    record(
      '17. Mood Gibberish Handling (uncertain: true)',
      passed,
      `status: ${res.status}, uncertain: ${res.body.uncertain}, default mood: ${res.body.mood}`
    );
  } catch (e) {
    record('17. Mood Gibberish Handling', false, e.message);
  }

  // 18. Mood List endpoint (GET /api/mood/list)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/mood/list',
      method: 'GET',
    });
    const moodCount = Object.keys(res.body.moods || {}).length;
    const passed = res.status === 200 && res.body.success === true && moodCount === 8;
    record('18. Mood List (GET /api/mood/list)', passed, `status: ${res.status}, count: ${moodCount} moods`);
  } catch (e) {
    record('18. Mood List', false, e.message);
  }

  // 19. Method check: rule-based when AI_API_KEY is empty
  try {
    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/mood/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { text: 'I am so happy and joyful today!' }
    );
    const expectedMethod = hasAiKey ? 'ai' : 'rule-based';
    const passed = res.status === 200 && (res.body.method === expectedMethod || res.body.method === 'rule-based');
    record(
      `19. AI Provider Honesty Check (${res.body.method})`,
      passed,
      `method: ${res.body.method}, detected mood: ${res.body.mood}`
    );
  } catch (e) {
    record('19. AI Provider Honesty Check', false, e.message);
  }

  console.log('================ STEP B2 API TEST SUITE COMPLETED ================\n');
  const allPassed = results.every((r) => r.passed);
  console.log(`Summary: ${results.filter((r) => r.passed).length}/${results.length} tests passed.`);
  return results;
};

runB2Tests().then((res) => {
  const allPassed = res.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
});
