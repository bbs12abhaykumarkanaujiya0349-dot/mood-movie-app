const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never return passwordHash in queries by default
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
      index: true,
    },
    favoriteMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
    preferences: {
      favoriteGenres: {
        type: [String],
        default: [],
      },
      language: {
        type: String,
        default: 'en',
        trim: true,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate movie IDs inside favoriteMovies and watchlist arrays on save
userSchema.pre('save', function (next) {
  if (this.isModified('favoriteMovies') && Array.isArray(this.favoriteMovies)) {
    this.favoriteMovies = [...new Set(this.favoriteMovies.map((id) => id.toString()))];
  }
  if (this.isModified('watchlist') && Array.isArray(this.watchlist)) {
    this.watchlist = [...new Set(this.watchlist.map((id) => id.toString()))];
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
