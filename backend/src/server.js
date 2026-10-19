const path = require('path');
const dotenv = require('dotenv');

// Load environment variables explicitly from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const app = require('./app');

// Global handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `🚀 Mood Movie Backend running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`
    );
  });

  // Gracefully handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down gracefully...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Gracefully handle termination signals
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('💥 Process terminated.');
    });
  });
};

startServer();
