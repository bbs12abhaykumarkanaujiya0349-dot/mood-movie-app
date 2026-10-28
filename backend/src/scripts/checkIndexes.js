/**
 * checkIndexes.js
 * Inspects all MongoDB collections and confirms required performance indexes exist:
 * 1. users: email
 * 2. movies: externalMovieId
 * 3. reviews: userId + movieId compound
 * 4. moodhistories: userId + createdAt compound
 */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const MoodHistory = require('../models/MoodHistory');

async function checkIndexes() {
  console.log('\n================ MONGO DATABASE INDEXES CHECK ================');
  await connectDB();

  // Ensure indexes are synced/built in MongoDB
  await Promise.all([
    User.syncIndexes(),
    Movie.syncIndexes(),
    Review.syncIndexes(),
    MoodHistory.syncIndexes(),
  ]);

  const collections = [
    { name: 'users', model: User, required: ['email'] },
    { name: 'movies', model: Movie, required: ['externalMovieId'] },
    { name: 'reviews', model: Review, required: ['userId_1_movieId_1'] },
    { name: 'moodhistories', model: MoodHistory, required: ['userId_1_createdAt_-1'] },
  ];

  let allPassed = true;

  for (const { name, model, required } of collections) {
    const indexes = await model.collection.indexes();
    console.log(`\nCollection [${name}] Indexes:`);
    const indexNames = [];
    indexes.forEach((idx) => {
      indexNames.push(idx.name);
      console.log(`  - ${idx.name} : ${JSON.stringify(idx.key)} (unique: ${Boolean(idx.unique)})`);
    });

    for (const req of required) {
      const exists = indexNames.some((n) => n.includes(req) || n === req);
      if (exists) {
        console.log(`  [CONFIRMED] Required index for "${req}" exists.`);
      } else {
        console.error(`  [MISSING] Required index for "${req}" was NOT found!`);
        allPassed = false;
      }
    }
  }

  console.log('\n=============================================================');
  if (allPassed) {
    console.log('✅ ALL REQUIRED DATABASE PERFORMANCE INDEXES ARE CONFIRMED!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME REQUIRED DATABASE INDEXES ARE MISSING!\n');
    process.exit(1);
  }
}

checkIndexes().catch((err) => {
  console.error('Index check failed:', err);
  process.exit(1);
});
