const { query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const validateMovieSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre parameter cannot exceed 50 characters'),
  query('year')
    .optional()
    .trim()
    .matches(/^\d{4}$/)
    .withMessage('Year must be a 4-digit number (e.g., 2022)'),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum rating must be a number between 0 and 10'),
  query('sort')
    .optional()
    .isIn(['popularity', 'rating', 'newest'])
    .withMessage('Sort must be one of: popularity, rating, newest'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  handleValidationErrors,
];

const validateMovieId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Movie ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid movie ID format'),
  handleValidationErrors,
];

module.exports = {
  validateMovieSearch,
  validateMovieId,
};
