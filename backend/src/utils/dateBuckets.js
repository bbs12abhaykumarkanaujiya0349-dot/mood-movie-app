/**
 * Pure utility functions for generating continuous date buckets
 * and merging aggregation results so chart timelines have no missing days.
 */

/**
 * Format a Date object to 'YYYY-MM-DD'
 * @param {Date} date 
 * @returns {string}
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate startDate from a range string ('7d', '30d', '90d') relative to an optional reference date.
 * @param {'7d'|'30d'|'90d'} range 
 * @param {Date} [referenceDate]
 * @returns {{ startDate: Date, endDate: Date, days: number }}
 */
const getDateRange = (range, referenceDate = new Date()) => {
  const daysMap = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const days = daysMap[range];
  if (!days) {
    throw new Error(`Invalid range: "${range}". Supported ranges: 7d, 30d, 90d.`);
  }

  const end = new Date(referenceDate);
  end.setUTCHours(23, 59, 59, 999);

  const start = new Date(referenceDate);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  return { startDate: start, endDate: end, days };
};

/**
 * Generate a continuous array of 'YYYY-MM-DD' dates between start and end inclusive.
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {string[]}
 */
const generateDateSeries = (startDate, endDate) => {
  const dates = [];
  const curr = new Date(startDate);
  curr.setUTCHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  while (curr <= end) {
    dates.push(formatDate(curr));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return dates;
};

/**
 * Merge MongoDB daily aggregation counts into a continuous date series,
 * filling missing days with specified default values (e.g. { count: 0 }).
 *
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {Array<{ date: string, [key: string]: any }>} data - Sparse aggregation results
 * @param {Record<string, any>} [defaultFields={ count: 0 }] - Default fields for zero-filled days
 * @returns {Array<{ date: string, [key: string]: any }>}
 */
const fillDateBuckets = (startDate, endDate, data = [], defaultFields = { count: 0 }) => {
  const lookup = new Map();
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && item.date) {
        lookup.set(item.date, item);
      }
    }
  }

  const series = generateDateSeries(startDate, endDate);
  return series.map((dateStr) => {
    const existing = lookup.get(dateStr);
    if (existing) {
      return { date: dateStr, ...defaultFields, ...existing };
    }
    return { date: dateStr, ...defaultFields };
  });
};

module.exports = {
  formatDate,
  getDateRange,
  generateDateSeries,
  fillDateBuckets,
};
