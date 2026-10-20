const express = require('express');
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} = require('../controllers/libraryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFavorites)
  .post(addToFavorites);

router.route('/:id')
  .delete(removeFromFavorites);

module.exports = router;
