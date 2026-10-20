const { body, param, validationResult } = require('express-validator');

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

/**
 * Strips HTML tags and escapes dangerous scripting characters to prevent XSS
 */
const sanitizeComment = (val) => {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>]/g, '')     // Clean residual brackets
    .trim();
};

const validateCreateReview = [
  body('movieId')
    .trim()
    .notEmpty()
    .withMessage('Movie ID is required')
    .isLength({ max: 100 })
    .withMessage('Movie ID cannot exceed 100 characters'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .notEmpty()
    .withMessage('Review comment is required')
    .customSanitizer(sanitizeComment)
    .isLength({ min: 1, max: 1000 })
    .withMessage('Review comment must be between 1 and 1000 characters'),
  handleValidationErrors,
];

const validateUpdateReview = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID format'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .customSanitizer(sanitizeComment)
    .isLength({ min: 1, max: 1000 })
    .withMessage('Review comment must be between 1 and 1000 characters'),
  handleValidationErrors,
];

module.exports = {
  sanitizeComment,
  validateCreateReview,
  validateUpdateReview,
};
