/**
 * High-order wrapper to catch rejected promises in async route handlers
 * and pass errors to next() for centralized handling.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
