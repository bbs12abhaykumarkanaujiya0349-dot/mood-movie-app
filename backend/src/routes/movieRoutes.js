const express = require('express');
const {
  search,
  getTrending,
  getPopular,
  getGenres,
  getDetails,
  getSimilar,
} = require('../controllers/movieController');
const {
  validateMovieSearch,
  validateMovieId,
} = require('../validators/movieValidator');

const router = express.Router();

// Specific routes must come before parameterized /:id routes
router.get('/search', validateMovieSearch, search);
router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/genres', getGenres);

// Parameterized movie routes
router.get('/:id/similar', validateMovieId, getSimilar);
router.get('/:id', validateMovieId, getDetails);

module.exports = router;
