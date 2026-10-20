const express = require('express');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require('../controllers/libraryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWatchlist)
  .post(addToWatchlist);

router.route('/:id')
  .delete(removeFromWatchlist);

module.exports = router;
