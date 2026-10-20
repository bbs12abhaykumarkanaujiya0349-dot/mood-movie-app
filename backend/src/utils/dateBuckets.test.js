const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  formatDate,
  getDateRange,
  generateDateSeries,
  fillDateBuckets,
} = require('./dateBuckets');

describe('Date Bucketing Pure Utility Functions', () => {
  test('formatDate outputs correct YYYY-MM-DD format', () => {
    const d = new Date('2026-05-15T12:00:00Z');
    assert.equal(formatDate(d), '2026-05-15');
  });

  test('getDateRange calculates exact day windows for 7d, 30d, 90d', () => {
    const ref = new Date('2026-10-20T12:00:00Z');

    const r7 = getDateRange('7d', ref);
    assert.equal(r7.days, 7);
    assert.equal(formatDate(r7.endDate), '2026-10-20');
    assert.equal(formatDate(r7.startDate), '2026-10-14');

    const r30 = getDateRange('30d', ref);
    assert.equal(r30.days, 30);
    assert.equal(formatDate(r30.endDate), '2026-10-20');
    assert.equal(formatDate(r30.startDate), '2026-09-21');

    const r90 = getDateRange('90d', ref);
    assert.equal(r90.days, 90);
    assert.equal(formatDate(r90.endDate), '2026-10-20');
    assert.equal(formatDate(r90.startDate), '2026-07-23');
  });

  test('getDateRange rejects invalid ranges with clear error', () => {
    assert.throws(() => getDateRange('14d'), /Invalid range: "14d"/);
    assert.throws(() => getDateRange('year'), /Invalid range: "year"/);
    assert.throws(() => getDateRange(''), /Invalid range: ""/);
  });

  test('generateDateSeries creates continuous dates without gaps', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-05T00:00:00Z');
    const series = generateDateSeries(start, end);

    assert.deepEqual(series, [
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
      '2026-01-05',
    ]);
    assert.equal(series.length, 5);
  });

  test('fillDateBuckets fills missing days with 0 and preserves aggregated data', () => {
    const start = new Date('2026-06-01T00:00:00Z');
    const end = new Date('2026-06-04T00:00:00Z');

    const sparseData = [
      { date: '2026-06-02', count: 5 },
      { date: '2026-06-04', count: 12 },
    ];

    const filled = fillDateBuckets(start, end, sparseData, { count: 0 });

    assert.equal(filled.length, 4);
    assert.deepEqual(filled, [
      { date: '2026-06-01', count: 0 },
      { date: '2026-06-02', count: 5 },
      { date: '2026-06-03', count: 0 },
      { date: '2026-06-04', count: 12 },
    ]);
  });

  test('fillDateBuckets supports multi-metric default values', () => {
    const start = new Date('2026-07-10T00:00:00Z');
    const end = new Date('2026-07-12T00:00:00Z');

    const activityData = [
      { date: '2026-07-11', recommendations: 8, reviews: 2 },
    ];

    const filled = fillDateBuckets(start, end, activityData, { recommendations: 0, reviews: 0 });

    assert.deepEqual(filled, [
      { date: '2026-07-10', recommendations: 0, reviews: 0 },
      { date: '2026-07-11', recommendations: 8, reviews: 2 },
      { date: '2026-07-12', recommendations: 0, reviews: 0 },
    ]);
  });

  test('fillDateBuckets handles empty data array gracefully', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-08-03T00:00:00Z');

    const filled = fillDateBuckets(start, end, [], { count: 0 });
    assert.equal(filled.length, 3);
    assert.deepEqual(filled, [
      { date: '2026-08-01', count: 0 },
      { date: '2026-08-02', count: 0 },
      { date: '2026-08-03', count: 0 },
    ]);
  });
});
