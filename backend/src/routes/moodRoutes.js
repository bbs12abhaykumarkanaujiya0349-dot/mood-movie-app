const express = require('express');
const { analyze, getMoodList } = require('../controllers/moodController');
const { validateMoodAnalyze } = require('../validators/moodValidator');

const router = express.Router();

router.post('/analyze', validateMoodAnalyze, analyze);
router.get('/list', getMoodList);

module.exports = router;
