const mongoose = require('mongoose');

const moodHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    inputText: {
      type: String,
      trim: true,
      default: '',
    },
    detectedMood: {
      type: String,
      required: [true, 'Detected mood is required'],
      trim: true,
      index: true,
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
    recommendationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for chronological timeline queries per user
moodHistorySchema.index({ userId: 1, createdAt: -1 });

const MoodHistory = mongoose.model('MoodHistory', moodHistorySchema);

module.exports = MoodHistory;
