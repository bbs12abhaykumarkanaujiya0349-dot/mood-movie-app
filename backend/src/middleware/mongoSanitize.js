/**
 * mongoSanitize.js
 * Middleware to sanitize incoming request body, query, and params against NoSQL injection attacks.
 * Strips any object keys starting with '$' or containing '.' characters.
 */

function sanitizeObject(target) {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      target[i] = sanitizeObject(target[i]);
    }
    return target;
  }

  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
    } else {
      sanitizeObject(target[key]);
    }
  }

  return target;
}

const mongoSanitize = (req, _res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = mongoSanitize;
