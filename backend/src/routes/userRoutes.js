const express = require('express');
const {
  getMyStats,
  updatePreferences,
  deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/me/stats', getMyStats);
router.patch('/me/preferences', updatePreferences);
router.delete('/me', deleteAccount);

module.exports = router;
