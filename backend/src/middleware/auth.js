const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect middleware:
 * Ensures request has a valid Bearer JWT token,
 * fetches the active user, and rejects blocked/missing accounts.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please provide a valid Bearer token.', 401)
    );
  }

  // Verify JWT token signature and expiration
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // Check if user account is blocked
  if (currentUser.status === 'blocked') {
    return next(
      new AppError('Your account has been blocked. Please contact support.', 403)
    );
  }

  // Grant access by attaching user object to request
  req.user = currentUser;
  next();
});

/**
 * Authorize middleware:
 * Role-Based Access Control (RBAC) checking allowed roles (e.g., 'ADMIN', 'USER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

/**
 * OptionalAuth middleware:
 * If Authorization header with valid Bearer token is present, attaches req.user.
 * If absent or invalid, proceeds without req.user without throwing an error.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.status !== 'blocked') {
      req.user = currentUser;
    }
  } catch {
    // Proceed as guest if token is invalid or expired
  }

  next();
});

module.exports = {
  protect,
  authorize,
  optionalAuth,
};
