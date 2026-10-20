const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const MoodHistory = require('../models/MoodHistory');
const localMovies = require('../data/localMovies');
const { SUPPORTED_MOODS } = require('../constants/moods');

const DEMO_DOMAIN = '@moodie.demo';

const runSeed = async () => {
  const isReset = process.argv.includes('--reset');
  const isForce = process.argv.includes('--force');

  // Safety check for production environment
  if (process.env.NODE_ENV === 'production' && !isForce) {
    console.error('Refusing to run seed script in production without --force flag.');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing from environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected successfully for seed operation.');

  try {
    if (isReset) {
      console.log('\n--- Resetting Seed Data ---');
      const seedUsers = await User.find({ email: { $regex: /@moodie\.demo$/i } }).select('_id');
      const seedUserIds = seedUsers.map((u) => u._id);

      const [delReviews, delHistory, delUsers] = await Promise.all([
        Review.deleteMany({ userId: { $in: seedUserIds } }),
        MoodHistory.deleteMany({ userId: { $in: seedUserIds } }),
        User.deleteMany({ email: { $regex: /@moodie\.demo$/i } }),
      ]);

      console.log(`Reset completed:`);
      console.log(`  - Deleted ${delUsers.deletedCount} demo users`);
      console.log(`  - Deleted ${delReviews.deletedCount} seed reviews`);
      console.log(`  - Deleted ${delHistory.deletedCount} seed mood history records`);
      console.log('Real data remained untouched.\n');
      return;
    }

    console.log('\n--- Starting Idempotent Database Seeding ---');

    // 1. Password hashes
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const userPasswordHash = await bcrypt.hash('User@12345', 10);

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // 2. Demo Users Specification
    const demoUsersData = [
      {
        name: 'Demo Admin',
        email: 'admin@moodie.demo',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        status: 'active',
        createdAt: new Date(now - 90 * dayMs),
        lastActive: new Date(now - 1 * dayMs),
        preferences: { favoriteGenres: ['Action', 'Sci-Fi', 'Thriller'], language: 'en' },
      },
      {
        name: 'Demo User',
        email: 'user@moodie.demo',
        passwordHash: userPasswordHash,
        role: 'USER',
        status: 'active',
        createdAt: new Date(now - 80 * dayMs),
        lastActive: new Date(now - 2 * dayMs),
        preferences: { favoriteGenres: ['Comedy', 'Adventure', 'Drama'], language: 'en' },
      },
      // 12 extra sample users with spread out creation dates across the last 90 days
      { name: 'Aarav Sharma', email: 'aarav@moodie.demo', daysAgo: 75, lastActiveDays: 1, role: 'USER' },
      { name: 'Emma Watson', email: 'emma@moodie.demo', daysAgo: 70, lastActiveDays: 3, role: 'USER' },
      { name: 'Liam Chen', email: 'liam@moodie.demo', daysAgo: 60, lastActiveDays: 5, role: 'USER' },
      { name: 'Sophia Rodriguez', email: 'sophia@moodie.demo', daysAgo: 50, lastActiveDays: 2, role: 'USER' },
      { name: 'Noah Patel', email: 'noah@moodie.demo', daysAgo: 45, lastActiveDays: 8, role: 'USER' },
      { name: 'Olivia Taylor', email: 'olivia@moodie.demo', daysAgo: 40, lastActiveDays: 4, role: 'USER' },
      { name: 'Lucas Rossi', email: 'lucas@moodie.demo', daysAgo: 30, lastActiveDays: 6, role: 'USER' },
      { name: 'Mia Tanaka', email: 'mia@moodie.demo', daysAgo: 25, lastActiveDays: 1, role: 'USER' },
      { name: 'Ethan Miller', email: 'ethan@moodie.demo', daysAgo: 20, lastActiveDays: 12, role: 'USER' },
      { name: 'Ava Dubois', email: 'ava@moodie.demo', daysAgo: 14, lastActiveDays: 2, role: 'USER' },
      { name: 'Mason Clark', email: 'mason@moodie.demo', daysAgo: 7, lastActiveDays: 0, role: 'USER' },
      { name: 'Isabella Silva', email: 'isabella@moodie.demo', daysAgo: 2, lastActiveDays: 0, role: 'USER' },
    ];

    const usersMap = new Map();

    for (const u of demoUsersData) {
      const createdAt = u.createdAt || new Date(now - u.daysAgo * dayMs);
      const lastActive = u.lastActive || new Date(now - u.lastActiveDays * dayMs);
      const userDoc = await User.findOneAndUpdate(
        { email: u.email },
        {
          $set: {
            name: u.name,
            passwordHash: u.passwordHash || userPasswordHash,
            role: u.role,
            status: u.status || 'active',
            lastActive,
            preferences: u.preferences || { favoriteGenres: ['Drama', 'Action'], language: 'en' },
          },
          $setOnInsert: {
            createdAt,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      usersMap.set(u.email, userDoc);
    }
    console.log(`✓ Seeded ${usersMap.size} demo users.`);

    // 3. Seed Local Fallback Movies (Idempotent upsert by externalMovieId)
    let seededMoviesCount = 0;
    for (const m of localMovies) {
      await Movie.findOneAndUpdate(
        { externalMovieId: m.externalId },
        {
          $set: {
            title: m.title,
            releaseDate: m.releaseDate,
            genres: m.genres,
            overview: m.overview,
            posterUrl: m.posterUrl || '',
            backdropUrl: m.backdropUrl || '',
            rating: m.rating,
            runtime: m.runtime,
            language: m.language,
            popularity: m.popularity,
            cast: m.cast,
            director: m.director,
            source: 'local',
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      seededMoviesCount++;
    }
    console.log(`✓ Seeded/verified ${seededMoviesCount} local catalog movies.`);

    // Retrieve active movies from MongoDB (including any previously cached OMDb movies)
    const allDbMovies = await Movie.find().limit(60);
    if (allDbMovies.length === 0) {
      throw new Error('No movies found in database for review and history seeding.');
    }
    console.log(`✓ Total movie catalog pool: ${allDbMovies.length} movies.`);

    // 4. Attach Watchlist & Favorites to Demo Users
    const demoUser = usersMap.get('user@moodie.demo');
    const demoAdmin = usersMap.get('admin@moodie.demo');

    if (demoUser && allDbMovies.length >= 4) {
      demoUser.watchlist = [allDbMovies[0]._id, allDbMovies[1]._id];
      demoUser.favoriteMovies = [allDbMovies[2]._id, allDbMovies[3]._id];
      await demoUser.save();
    }
    if (demoAdmin && allDbMovies.length >= 6) {
      demoAdmin.watchlist = [allDbMovies[4]._id];
      demoAdmin.favoriteMovies = [allDbMovies[0]._id, allDbMovies[5]._id];
      await demoAdmin.save();
    }
    console.log('✓ Attached watchlist and favorite movies to demo accounts.');

    // 5. Seed ~30 Reviews across sample movies
    const sampleReviewsData = [
      { rating: 5, comment: 'An absolute cinematic masterpiece with mind-bending visuals!', sentiment: 'positive' },
      { rating: 5, comment: 'One of the greatest films ever made. Outstanding performances and score.', sentiment: 'positive' },
      { rating: 4, comment: 'Deeply emotional and thoughtfully executed. Highly recommended.', sentiment: 'positive' },
      { rating: 4, comment: 'A thrilling ride from start to finish. Loved the plot twists.', sentiment: 'positive' },
      { rating: 5, comment: 'Heartwarming, hilarious, and utterly charming story for the entire family.', sentiment: 'positive' },
      { rating: 4, comment: 'Captivating atmosphere and incredible direction.', sentiment: 'positive' },
      { rating: 5, comment: 'Simply breathtaking. A must-watch on the biggest screen possible.', sentiment: 'positive' },
      { rating: 4, comment: 'Great entertainment with plenty of laughs and memorable quotes.', sentiment: 'positive' },
      { rating: 5, comment: 'Inspiring, uplifting, and beautifully written. Touched my heart.', sentiment: 'positive' },
      { rating: 4, comment: 'Superb pacing and brilliant acting all around.', sentiment: 'positive' },

      { rating: 3, comment: 'Decent watch for a lazy afternoon. Enjoyable but somewhat predictable.', sentiment: 'neutral' },
      { rating: 3, comment: 'Visuals were great, but the plot dragged a bit in the second act.', sentiment: 'neutral' },
      { rating: 3, comment: 'Mixed feelings: strong opening followed by a convoluted finale.', sentiment: 'neutral' },
      { rating: 3, comment: 'Average film with a few standout moments. Good soundtrack.', sentiment: 'neutral' },
      { rating: 3, comment: 'Not bad, but did not quite live up to the massive hype.', sentiment: 'neutral' },
      { rating: 3, comment: 'Solid performances save an otherwise mediocre script.', sentiment: 'neutral' },
      { rating: 3, comment: 'Fun in parts, but tone felt inconsistent between comedy and drama.', sentiment: 'neutral' },
      { rating: 3, comment: 'Entertaining popcorn movie, but forgettable by tomorrow.', sentiment: 'neutral' },

      { rating: 2, comment: 'Disappointing execution. The pacing was agonizingly slow.', sentiment: 'negative' },
      { rating: 1, comment: 'Terrible dialogue and plot holes everywhere. Could not finish it.', sentiment: 'negative' },
      { rating: 2, comment: 'Felt like a hollow cash-grab. Lacked soul and depth.', sentiment: 'negative' },
      { rating: 1, comment: 'Painfully dull and cliché from beginning to end.', sentiment: 'negative' },
      { rating: 2, comment: 'Frustrating characters make decisions that make zero sense.', sentiment: 'negative' },
      { rating: 1, comment: 'Waste of time and talent. Great actors wasted on a lazy script.', sentiment: 'negative' },

      { rating: 5, comment: 'Spectacular world-building that leaves you wanting more.', sentiment: 'positive' },
      { rating: 4, comment: 'A wonderful love letter to classic cinema.', sentiment: 'positive' },
      { rating: 4, comment: 'Intense and nerve-wracking suspense that pays off brilliantly.', sentiment: 'positive' },
      { rating: 3, comment: 'Standard genre fare. Worth watching once if you like the actors.', sentiment: 'neutral' },
      { rating: 2, comment: 'Overly melodramatic and predictable ending.', sentiment: 'negative' },
      { rating: 5, comment: 'Pure adrenaline! Best action movie of the decade.', sentiment: 'positive' },
    ];

    const usersList = Array.from(usersMap.values());
    let seededReviewsCount = 0;

    for (let i = 0; i < sampleReviewsData.length; i++) {
      const u = usersList[i % usersList.length];
      const m = allDbMovies[i % allDbMovies.length];
      const revData = sampleReviewsData[i];

      const reviewDate = new Date(now - (30 - i) * dayMs);

      await Review.findOneAndUpdate(
        { userId: u._id, movieId: m._id },
        {
          $set: {
            rating: revData.rating,
            comment: revData.comment,
            sentiment: revData.sentiment,
            status: 'visible',
          },
          $setOnInsert: {
            createdAt: reviewDate,
          },
        },
        { upsert: true }
      );
      seededReviewsCount++;
    }
    console.log(`✓ Seeded ${seededReviewsCount} reviews across catalog movies.`);

    // 6. Seed ~40 Mood History Entries across all 8 moods
    const sampleMoodTexts = {
      Happy: ['feeling cheerful and full of joy today', 'celebrating with good friends tonight', 'great news at work, so joyful!'],
      Sad: ['feeling low and heartbroken', 'really lonely and down today', 'depressed and need comforting words'],
      Romantic: ['in love and feeling warm affection', 'date night with my partner', 'sweet romantic evening together'],
      Angry: ['so furious and frustrated right now', 'betrayed and full of rage', 'annoyed with everything today'],
      Excited: ['super hyped and ready for high energy', 'pumped up for the weekend', 'thrilled about upcoming adventures'],
      Relaxed: ['chill quiet Sunday afternoon', 'calm and peaceful vibes', 'unwinding with a cup of tea'],
      Fearful: ['spooked and looking for scares', 'terrified by ghost stories', 'chilling horror film mood'],
      Motivated: ['grinding on goals, need inspiring discipline', 'ready to hustle and conquer the world', 'driven to succeed against all odds'],
    };

    let seededHistoryCount = 0;

    for (let i = 0; i < 40; i++) {
      const mood = SUPPORTED_MOODS[i % SUPPORTED_MOODS.length];
      const texts = sampleMoodTexts[mood] || ['Selected manually'];
      const text = texts[i % texts.length];
      const u = usersList[i % usersList.length];

      // Spread dates across the last 90 days
      const daysAgo = Math.floor((i / 40) * 85) + 1;
      const historyDate = new Date(now - daysAgo * dayMs);

      // Attach 3-4 sample movie references
      const sampleRecIds = [
        allDbMovies[(i * 2) % allDbMovies.length]._id,
        allDbMovies[(i * 2 + 1) % allDbMovies.length]._id,
        allDbMovies[(i * 2 + 2) % allDbMovies.length]._id,
      ];

      // Check if entry for this user and timestamp already exists to remain idempotent
      const existing = await MoodHistory.findOne({
        userId: u._id,
        inputText: text,
        detectedMood: mood,
      });

      if (!existing) {
        await MoodHistory.create({
          userId: u._id,
          inputText: text,
          detectedMood: mood,
          confidence: 0.95,
          recommendationIds: sampleRecIds,
          createdAt: historyDate,
        });
        seededHistoryCount++;
      } else {
        seededHistoryCount++;
      }
    }
    console.log(`✓ Seeded ${seededHistoryCount} mood history logs across 8 moods.`);

    console.log('\n===================================================');
    console.log('           SEEDING COMPLETED SUCCESSFULLY          ');
    console.log('===================================================');
    console.log(`Total Demo Users:     ${usersMap.size}`);
    console.log(`Total Movies Pool:    ${allDbMovies.length}`);
    console.log(`Total Seed Reviews:   ${seededReviewsCount}`);
    console.log(`Total Seed Histories: ${seededHistoryCount}`);
    console.log('---------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('  ADMIN: admin@moodie.demo / Admin@12345');
    console.log('  USER:  user@moodie.demo  / User@12345');
    console.log('===================================================\n');
  } catch (err) {
    console.error('Seed execution error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

runSeed();
