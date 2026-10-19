const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

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

const runTests = async () => {
  console.log('\n================ STARTING STEP B1 TEST SUITE ================');
  const results = [];

  const record = (name, passed, details = '') => {
    results.push({ name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${details ? '- ' + details : ''}`);
  };

  try {
    // Connect to DB directly for admin promotion and cleanup
    await mongoose.connect(process.env.MONGO_URI);

    // Clean up any previous test user
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    // 1. Health check
    try {
      const res = await makeRequest({
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path: '/api/health',
        method: 'GET',
      });
      const passed = res.status === 200 && res.body.status === 'ok' && res.body.db === 'connected';
      record('1. Health check', passed, `status: ${res.status}, db: ${res.body.db}`);
    } catch (e) {
      record('1. Health check', false, e.message);
    }

    // 2. Register OK
    let token = '';
    let userId = '';
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { name: 'Test User', email: testEmail, password: testPassword }
      );
      token = res.body.token;
      userId = res.body.user?.id;
      const passed =
        res.status === 201 &&
        res.body.success === true &&
        token &&
        !res.body.user?.passwordHash;
      record('2. Register OK', passed, `status: ${res.status}, token received, passwordHash excluded`);
    } catch (e) {
      record('2. Register OK', false, e.message);
    }

    // 3. Register duplicate email (409)
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { name: 'Test User 2', email: testEmail, password: testPassword }
      );
      const passed = res.status === 409 && res.body.success === false;
      record('3. Register duplicate email (409)', passed, `status: ${res.status}, message: "${res.body.message}"`);
    } catch (e) {
      record('3. Register duplicate email (409)', false, e.message);
    }

    // 4. Register invalid data (400)
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { name: 'A', email: 'invalid-email', password: 'short' }
      );
      const passed = res.status === 400 && res.body.success === false && Array.isArray(res.body.errors);
      record('4. Register invalid data (400)', passed, `status: ${res.status}, errors count: ${res.body.errors?.length}`);
    } catch (e) {
      record('4. Register invalid data (400)', false, e.message);
    }

    // 5. Login OK
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: testEmail, password: testPassword }
      );
      const passed = res.status === 200 && res.body.success === true && res.body.token;
      record('5. Login OK', passed, `status: ${res.status}, token re-issued`);
    } catch (e) {
      record('5. Login OK', false, e.message);
    }

    // 6. Login wrong password (401)
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: testEmail, password: 'WrongPassword999' }
      );
      const passed = res.status === 401 && res.body.success === false;
      record('6. Login wrong password (401)', passed, `status: ${res.status}, message: "${res.body.message}"`);
    } catch (e) {
      record('6. Login wrong password (401)', false, e.message);
    }

    // 7. /me without token (401)
    try {
      const res = await makeRequest({
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path: '/api/auth/me',
        method: 'GET',
      });
      const passed = res.status === 401 && res.body.success === false;
      record('7. /me without token (401)', passed, `status: ${res.status}`);
    } catch (e) {
      record('7. /me without token (401)', false, e.message);
    }

    // 8. /me with token (200)
    try {
      const res = await makeRequest({
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const passed = res.status === 200 && res.body.success === true && res.body.user?.email === testEmail;
      record('8. /me with token (200)', passed, `status: ${res.status}, user: ${res.body.user?.name}`);
    } catch (e) {
      record('8. /me with token (200)', false, e.message);
    }

    // 8a. PATCH /api/auth/me (200) - Update profile
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/me',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        { name: 'Updated Name', preferences: { favoriteGenres: ['Sci-Fi', 'Action'] } }
      );
      const passed = res.status === 200 && res.body.success === true && res.body.user?.name === 'Updated Name';
      record('8a. PATCH /api/auth/me (200)', passed, `status: ${res.status}, updated name: ${res.body.user?.name}`);
    } catch (e) {
      record('8a. PATCH /api/auth/me (200)', false, e.message);
    }

    // 8b. PATCH /api/auth/password with wrong current password (401)
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/password',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        { currentPassword: 'WrongPassword1', newPassword: 'NewPassword999!' }
      );
      const passed = res.status === 401 && res.body.success === false;
      record('8b. PATCH /password wrong current (401)', passed, `status: ${res.status}, message: "${res.body.message}"`);
    } catch (e) {
      record('8b. PATCH /password wrong current (401)', false, e.message);
    }

    // 8c. PATCH /api/auth/password with valid passwords (200)
    try {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/password',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        { currentPassword: testPassword, newPassword: 'NewPassword999!' }
      );
      const passed = res.status === 200 && res.body.success === true;
      record('8c. PATCH /password valid (200)', passed, `status: ${res.status}, message: "${res.body.message}"`);
    } catch (e) {
      record('8c. PATCH /password valid (200)', false, e.message);
    }

    // 8d. POST /api/auth/logout (200)
    try {
      const res = await makeRequest({
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path: '/api/auth/logout',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const passed = res.status === 200 && res.body.success === true;
      record('8d. POST /api/auth/logout (200)', passed, `status: ${res.status}, message: "${res.body.message}"`);
    } catch (e) {
      record('8d. POST /api/auth/logout (200)', false, e.message);
    }

    // 9. /admin/ping as USER (403)
    try {
      const res = await makeRequest({
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path: '/api/admin/ping',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const passed = res.status === 403 && res.body.success === false;
      record('9. /admin/ping as USER (403)', passed, `status: ${res.status}, role USER blocked`);
    } catch (e) {
      record('9. /admin/ping as USER (403)', false, e.message);
    }

    // 10. Promote user to ADMIN directly in DB, re-login & test /admin/ping (200)
    try {
      await User.findByIdAndUpdate(userId, { role: 'ADMIN' });
      // Re-login to get updated JWT token with ADMIN role (using new password from test 8c)
      const loginRes = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: testEmail, password: 'NewPassword999!' }
      );
      const adminToken = loginRes.body.token;

      const adminPingRes = await makeRequest({
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path: '/api/admin/ping',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const passed = adminPingRes.status === 200 && adminPingRes.body.success === true;
      record('10. /admin/ping as ADMIN (200)', passed, `status: ${adminPingRes.status}, message: "${adminPingRes.body.message}"`);
    } catch (e) {
      record('10. /admin/ping as ADMIN (200)', false, e.message);
    }

    // 11. Block user in DB -> test login (403)
    try {
      await User.findByIdAndUpdate(userId, { status: 'blocked' });
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: testEmail, password: 'NewPassword999!' }
      );
      const passed = res.status === 403 && res.body.success === false;
      record('11. Blocked user login (403)', passed, `status: ${res.status}, message: "${res.body.message}"`);
    } catch (e) {
      record('11. Blocked user login (403)', false, e.message);
    }

    // 12. Rate limiter responds
    try {
      let triggered429 = false;
      // Send rapid requests to exceed authLimiter threshold (20 limit)
      for (let i = 0; i < 25; i++) {
        const res = await makeRequest(
          {
            hostname: 'localhost',
            port: process.env.PORT || 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          { email: 'random@test.com', password: 'AnyPassword123' }
        );
        if (res.status === 429) {
          triggered429 = true;
          break;
        }
      }
      record('12. Rate limiter responds (429)', triggered429, 'Rate limiter successfully throttled rapid attempts');
    } catch (e) {
      record('12. Rate limiter responds (429)', false, e.message);
    }

    // Cleanup: Delete test user from DB
    await User.findByIdAndDelete(userId);
    console.log(`🧹 Cleaned up test user ${testEmail} from MongoDB.`);

    await mongoose.disconnect();
    console.log('================ TEST SUITE COMPLETED ================\n');
    return results;
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
};

runTests().then((res) => {
  const allPassed = res.every((r) => r.passed);
  console.log(`Summary: ${res.filter((r) => r.passed).length}/${res.length} tests passed.`);
  process.exit(allPassed ? 0 : 1);
});
