const express = require('express');
const {
  getHistory,
  deleteHistoryItem,
  clearAllHistory,
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHistory)
  .delete(clearAllHistory);

router.route('/:id')
  .delete(deleteHistoryItem);

module.exports = router;
