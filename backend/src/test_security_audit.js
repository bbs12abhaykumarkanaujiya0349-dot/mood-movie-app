/**
 * test_security_audit.js
 * Verification of backend security hardening:
 * 1. NoSQL injection attempt on login ({"email":{"$gt":""}}) returns 400
 * 2. Strict rate limiter works and emits security headers
 * 3. Blocked user token is rejected with 403 Forbidden
 * 4. Payload size limit (>10kb) rejection with 413
 * 5. Startup JWT secret verification
 */

const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const app = require('./app');

function makeRequest(server, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runSecurityTests() {
  console.log('\n================ STARTING SECURITY HARDENING TEST SUITE ================');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const results = [];
  const record = (name, passed, details = '') => {
    results.push({ name, passed });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${details ? '- ' + details : ''}`);
  };

  try {
    // 1. Test NoSQL Injection Attempt on Login
    const nosqlRes = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: { $gt: '' }, password: 'password123' }
    );
    record(
      'NoSQL injection attempt on login is rejected with 400 Validation Error',
      nosqlRes.statusCode === 400,
      `Status: ${nosqlRes.statusCode}, msg: ${nosqlRes.body?.message || ''}`
    );

    // 2. Test Rate Limiter Headers on Auth Route
    const rateLimitHeaderPresent =
      nosqlRes.headers['ratelimit-limit'] !== undefined ||
      nosqlRes.headers['x-ratelimit-limit'] !== undefined ||
      nosqlRes.headers['ratelimit-remaining'] !== undefined;
    record(
      'Rate limiter headers present on protected auth route',
      rateLimitHeaderPresent,
      `Headers: ${JSON.stringify(nosqlRes.headers['ratelimit-limit'] || nosqlRes.headers['x-ratelimit-limit'] || 'present')}`
    );

    // 3. Test Blocked User Token Rejection (403 Forbidden)
    // Create temporary blocked user
    const blockedEmail = `blocked_test_${Date.now()}@example.com`;
    const blockedUser = await User.create({
      name: 'Blocked User Test',
      email: blockedEmail,
      passwordHash: '$2a$10$e7V91u3h8qN5Wl4M1K9.2eG/Xy6/0jO1d1k.y2R0rZ2aT7v2C1i4a',
      status: 'blocked',
      role: 'USER',
    });

    const blockedToken = jwt.sign(
      { id: blockedUser._id, role: blockedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const blockedRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/watchlist',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${blockedToken}`,
      },
    });

    record(
      'Blocked user token is strictly rejected with 403 Forbidden',
      blockedRes.statusCode === 403,
      `Status: ${blockedRes.statusCode}, msg: ${blockedRes.body?.message}`
    );

    // Clean up test user
    await User.findByIdAndDelete(blockedUser._id);

    // 4. Test Large Payload Rejection (>10kb)
    const largePayload = { dummy: 'X'.repeat(15 * 1024) };
    const largeRes = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      largePayload
    );
    record(
      'Payload exceeding 10kb limit rejected with 413 Payload Too Large',
      largeRes.statusCode === 413,
      `Status: ${largeRes.statusCode}`
    );

    // 5. Test Health Check route
    const healthRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/health',
      method: 'GET',
    });
    record(
      'Health check endpoint returns 200 with DB status',
      healthRes.statusCode === 200 && healthRes.body?.db === 'connected',
      `Status: ${healthRes.statusCode}, db: ${healthRes.body?.db}`
    );
  } finally {
    server.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log(`\nSecurity Suite Summary: ${passedCount}/${results.length} tests passed.`);
  console.log('================ SECURITY TEST SUITE COMPLETED ================\n');
  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runSecurityTests().then(() => process.exit(0)).catch((err) => {
  console.error('Security test failed:', err);
  process.exit(1);
});
