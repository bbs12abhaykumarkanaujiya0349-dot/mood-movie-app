const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.error('\n' + '='.repeat(60));
    console.error('❌ MONGODB CONNECTION ERROR: MONGO_URI is missing or empty.');
    console.error('👉 Hint: Open "backend/.env" and set MONGO_URI to your connection string.');
    console.error('   Examples:');
    console.error('     Local:   MONGO_URI=mongodb://127.0.0.1:27017/mood_movie_db');
    console.error('     Atlas:   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mood_movie_db');
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri.trim());
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error(`❌ MONGODB CONNECTION FAILED: ${error.message}`);
    console.error('👉 Hint: Ensure your MongoDB server is running or check your network/credentials.');
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
};

module.exports = connectDB;
