const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Helper to sign JWT
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper to strip sensitive fields before returning user object
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  favoriteMovies: user.favoriteMovies || [],
  watchlist: user.watchlist || [],
  preferences: user.preferences || { favoriteGenres: [], language: 'en' },
  lastActive: user.lastActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @desc   Register new user
 * @route  POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // 1. Check duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 409));
  }

  // 2. Hash password with bcryptjs (12 rounds)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Create user in database
  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  // 4. Issue JWT token
  const token = signToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @desc   Authenticate user & obtain token
 * @route  POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Find user and explicitly select passwordHash
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    // Generic error to not reveal whether email exists
    return next(new AppError('Invalid email or password', 401));
  }

  // 2. Check password comparison
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    // Generic error to not reveal whether password was the issue
    return next(new AppError('Invalid email or password', 401));
  }

  // 3. Reject blocked users
  if (user.status === 'blocked') {
    return next(
      new AppError('Your account has been blocked. Please contact support.', 403)
    );
  }

  // 4. Update lastActive timestamp
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  // 5. Sign token and respond
  const token = signToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @desc   Get current authenticated user profile
 * @route  GET /api/auth/me
 * @access Protected (User / Admin)
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

/**
 * @desc   User logout handshake
 * @route  POST /api/auth/logout
 * @access Protected
 *
 * NOTE: JWT authentication is stateless. The backend does not maintain server-side
 * session tokens. The frontend client performs logout by removing the JWT token
 * from its local storage / memory. This endpoint confirms the logout request.
 */
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @desc   Update current user name / preferences
 * @route  PATCH /api/auth/me
 * @access Protected
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (preferences !== undefined) updates.preferences = preferences;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    returnDocument: 'after',
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user: sanitizeUser(updatedUser),
  });
});

/**
 * @desc   Change password
 * @route  PATCH /api/auth/password
 * @access Protected
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Retrieve user with passwordHash
  const user = await User.findById(req.user._id).select('+passwordHash');

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Hash new password and save
  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  updateMe,
  changePassword,
};
