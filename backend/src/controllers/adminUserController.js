const User = require('../models/User');
const Review = require('../models/Review');
const MoodHistory = require('../models/MoodHistory');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc   List all users with search, role, status filtering and pagination
 * @route  GET /api/admin/users
 * @access Protected (Admin only)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search && search.trim() !== '') {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }

  if (role && ['USER', 'ADMIN'].includes(role.toUpperCase())) {
    query.role = role.toUpperCase();
  }

  if (status && ['active', 'blocked'].includes(status.toLowerCase())) {
    query.status = status.toLowerCase();
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    users,
  });
});

/**
 * @desc   Get specific user by ID
 * @route  GET /api/admin/users/:id
 * @access Protected (Admin only)
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc   Update user status (active | blocked)
 * @route  PATCH /api/admin/users/:id/status
 * @access Protected (Admin only)
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !['active', 'blocked'].includes(status.toLowerCase())) {
    throw new AppError('Status must be either "active" or "blocked".', 400);
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  // Prevent admin from blocking their own account
  if (req.user._id.toString() === targetUser._id.toString()) {
    throw new AppError('Admins cannot block their own account.', 400);
  }

  targetUser.status = status.toLowerCase();
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User status successfully updated to "${targetUser.status}".`,
    user: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      status: targetUser.status,
    },
  });
});

/**
 * @desc   Update user role (USER | ADMIN)
 * @route  PATCH /api/admin/users/:id/role
 * @access Protected (Admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role || !['USER', 'ADMIN'].includes(role.toUpperCase())) {
    throw new AppError('Role must be either "USER" or "ADMIN".', 400);
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  const newRole = role.toUpperCase();

  // Prevent admin from demoting their own account
  if (req.user._id.toString() === targetUser._id.toString() && newRole !== 'ADMIN') {
    throw new AppError('Admins cannot demote their own account.', 400);
  }

  // Protect last remaining administrator from demotion
  if (targetUser.role === 'ADMIN' && newRole === 'USER') {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount <= 1) {
      throw new AppError('Cannot demote the last remaining administrator.', 400);
    }
  }

  targetUser.role = newRole;
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User role successfully updated to "${targetUser.role}".`,
    user: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      status: targetUser.status,
    },
  });
});

/**
 * @desc   Delete user and cascade delete their reviews and history
 * @route  DELETE /api/admin/users/:id
 * @access Protected (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  // Prevent self-deletion
  if (req.user._id.toString() === targetUser._id.toString()) {
    throw new AppError('Admins cannot delete their own account.', 400);
  }

  // Protect last remaining administrator
  if (targetUser.role === 'ADMIN') {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount <= 1) {
      throw new AppError('Cannot delete the last remaining administrator.', 400);
    }
  }

  // Cascade delete
  await Promise.all([
    User.findByIdAndDelete(targetUser._id),
    Review.deleteMany({ userId: targetUser._id }),
    MoodHistory.deleteMany({ userId: targetUser._id }),
  ]);

  res.status(200).json({
    success: true,
    message: 'User account and associated reviews and history have been deleted.',
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
