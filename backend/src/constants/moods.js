/**
 * SRS Section 6: Official Mood Categories & Genre Mapping
 */
const MOOD_GENRES = {
  Happy: ['Comedy', 'Family', 'Adventure', 'Feel-Good'],
  Sad: ['Drama', 'Inspirational', 'Feel-Good'],
  Romantic: ['Romance', 'Drama', 'Romantic Comedy'],
  Angry: ['Action', 'Thriller', 'Adventure'],
  Excited: ['Action', 'Adventure', 'Sci-Fi'],
  Relaxed: ['Comedy', 'Family', 'Animation', 'Light Drama'],
  Fearful: ['Horror', 'Mystery', 'Thriller'],
  Motivated: ['Biography', 'Sports', 'Inspirational', 'Drama'],
};

const SUPPORTED_MOODS = Object.keys(MOOD_GENRES);

const MOOD_METADATA = {
  Happy: {
    label: 'Happy',
    description: 'Upbeat, cheerful, lighthearted entertainment',
    genres: MOOD_GENRES.Happy,
  },
  Sad: {
    label: 'Sad',
    description: 'Emotional, poignant, and touching stories',
    genres: MOOD_GENRES.Sad,
  },
  Romantic: {
    label: 'Romantic',
    description: 'Love, passion, heartfelt chemistry',
    genres: MOOD_GENRES.Romantic,
  },
  Angry: {
    label: 'Angry',
    description: 'High octane, visceral action and revenge thrillers',
    genres: MOOD_GENRES.Angry,
  },
  Excited: {
    label: 'Excited',
    description: 'Adrenaline rushes, mind-bending adventures and sci-fi',
    genres: MOOD_GENRES.Excited,
  },
  Relaxed: {
    label: 'Relaxed',
    description: 'Calming, comforting, feel-good cinema',
    genres: MOOD_GENRES.Relaxed,
  },
  Fearful: {
    label: 'Fearful',
    description: 'Spine-chilling horror and gripping mysteries',
    genres: MOOD_GENRES.Fearful,
  },
  Motivated: {
    label: 'Motivated',
    description: 'Triumphant biographies and inspiring underdog journeys',
    genres: MOOD_GENRES.Motivated,
  },
};

module.exports = {
  MOOD_GENRES,
  SUPPORTED_MOODS,
  MOOD_METADATA,
};
