const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @desc   Temporary test route to verify ADMIN role authorization
 * @route  GET /api/admin/ping
 * @access Protected (Admin only)
 */
router.get('/ping', protect, authorize('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin pong! Access verified.',
    admin: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

module.exports = router;
