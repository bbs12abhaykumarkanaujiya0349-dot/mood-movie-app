const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminUserController');

const {
  getAdminReviews,
  updateReviewStatus,
  deleteAdminReview,
} = require('../controllers/adminReviewController');

const {
  getAdminMovies,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie,
} = require('../controllers/adminMovieController');

const {
  getAnalyticsOverview,
  getAnalyticsCharts,
} = require('../controllers/adminAnalyticsController');

const router = express.Router();

// Strict RBAC: All admin routes require valid authentication and ADMIN role
router.use(protect, authorize('ADMIN'));

/**
 * @route  GET /api/admin/ping
 * @desc   Verification / sanity check for ADMIN authorization
 */
router.get('/ping', (req, res) => {
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

// User Governance
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Review Moderation
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/status', updateReviewStatus);
router.delete('/reviews/:id', deleteAdminReview);

// Movie Catalog Management
router.get('/movies', getAdminMovies);
router.post('/movies', createAdminMovie);
router.patch('/movies/:id', updateAdminMovie);
router.delete('/movies/:id', deleteAdminMovie);

// Analytics & Visualizations
router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/charts', getAnalyticsCharts);

module.exports = router;
