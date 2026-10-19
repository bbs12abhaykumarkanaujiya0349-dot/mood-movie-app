const { body, validationResult } = require('express-validator');

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

const validateMoodAnalyze = [
  body('text')
    .exists({ checkFalsy: true })
    .withMessage('Text input is required.')
    .bail()
    .isString()
    .withMessage('Text must be a string.')
    .bail()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Input text must be at least 3 characters long.')
    .bail()
    .isLength({ max: 500 })
    .withMessage('Input text cannot exceed 500 characters.'),
  handleValidationErrors,
];

module.exports = {
  validateMoodAnalyze,
};
