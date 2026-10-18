import api from './api';
import { MOCK_MOVIES } from '../data/movies';
import { MOCK_REVIEWS } from '../data/reviews';
import { MOCK_MOOD_HISTORY } from '../data/moodHistory';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const getStored = (key, fallback = []) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const userService = {
  /**
   * Get user watchlist
   * MOCK: replace with real API in integration step -> return (await api.get('/watchlist')).data;
   */
  async getWatchlist() {
    await delay(300);
    const ids = getStored('moodie_watchlist', ['m1', 'm3', 'm6']);
    return MOCK_MOVIES.filter((m) => ids.includes(m.id));
  },

  async addToWatchlist(movieId) {
    await delay(200);
    const ids = getStored('moodie_watchlist', ['m1', 'm3', 'm6']);
    if (!ids.includes(movieId)) {
      ids.push(movieId);
      setStored('moodie_watchlist', ids);
    }
    return { success: true, watchlist: ids };
  },

  async removeFromWatchlist(movieId) {
    await delay(200);
    let ids = getStored('moodie_watchlist', ['m1', 'm3', 'm6']);
    ids = ids.filter((id) => id !== movieId);
    setStored('moodie_watchlist', ids);
    return { success: true, watchlist: ids };
  },

  /**
   * Get user favorites
   * MOCK: replace with real API in integration step -> return (await api.get('/favorites')).data;
   */
  async getFavorites() {
    await delay(300);
    const ids = getStored('moodie_favorites', ['m9', 'm21']);
    return MOCK_MOVIES.filter((m) => ids.includes(m.id));
  },

  async addToFavorites(movieId) {
    await delay(200);
    const ids = getStored('moodie_favorites', ['m9', 'm21']);
    if (!ids.includes(movieId)) {
      ids.push(movieId);
      setStored('moodie_favorites', ids);
    }
    return { success: true, favorites: ids };
  },

  async removeFromFavorites(movieId) {
    await delay(200);
    let ids = getStored('moodie_favorites', ['m9', 'm21']);
    ids = ids.filter((id) => id !== movieId);
    setStored('moodie_favorites', ids);
    return { success: true, favorites: ids };
  },

  /**
   * Get recommendation query history
   * MOCK: replace with real API in integration step -> return (await api.get('/history')).data;
   */
  async getHistory() {
    await delay(300);
    return getStored('moodie_history', MOCK_MOOD_HISTORY);
  },

  /**
   * Add entry to mood history
   * MOCK: replace with real API in integration step -> return (await api.post('/history', entry)).data;
   */
  async addHistory(entry) {
    await delay(150);
    const history = getStored('moodie_history', MOCK_MOOD_HISTORY);
    const newEntry = {
      id: `h_${Date.now()}`,
      ...entry,
      createdAt: new Date().toISOString()
    };
    history.unshift(newEntry);
    setStored('moodie_history', history);
    return newEntry;
  },

  /**
   * Clear all recommendation history
   * MOCK: replace with real API in integration step -> return (await api.delete('/history')).data;
   */
  async clearHistory() {
    await delay(300);
    setStored('moodie_history', []);
    return { success: true };
  },

  /**
   * Update user profile information
   * MOCK: replace with real API in integration step -> return (await api.put('/user/profile', data)).data;
   */
  async updateProfile(data) {
    await delay(400);
    const storedUser = getStored('moodie_user', {});
    const updated = { ...storedUser, ...data };
    setStored('moodie_user', updated);
    return updated;
  },

  /**
   * Change user account password
   * MOCK: replace with real API in integration step -> return (await api.put('/user/password', data)).data;
   */
  async changePassword({ currentPassword, newPassword }) {
    await delay(450);
    if (!currentPassword || !newPassword) {
      throw new Error('Current and new password are required');
    }
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
    return { success: true };
  },

  /**
   * Delete user account
   * MOCK: replace with real API in integration step -> return (await api.delete('/user/account')).data;
   */
  async deleteAccount() {
    await delay(500);
    localStorage.removeItem('moodie_user');
    localStorage.removeItem('moodie_token');
    localStorage.removeItem('moodie_watchlist');
    localStorage.removeItem('moodie_favorites');
    localStorage.removeItem('moodie_history');
    return { success: true };
  },

  /**
   * Get reviews created by current user
   * MOCK: replace with real API in integration step -> return (await api.get('/user/reviews')).data;
   */
  async getUserReviews() {
    await delay(300);
    return MOCK_REVIEWS.slice(0, 4);
  },

  /**
   * Get user preferences (favorite genres, preferred language)
   * MOCK: replace with real API in integration step -> return (await api.get('/user/preferences')).data;
   */
  async getPreferences() {
    await delay(250);
    return getStored('moodie_preferences', {
      favoriteGenres: ['Sci-Fi', 'Comedy', 'Drama'],
      preferredLanguage: 'English'
    });
  },

  /**
   * Update user preferences
   * MOCK: replace with real API in integration step -> return (await api.put('/user/preferences', data)).data;
   */
  async updatePreferences(data) {
    await delay(350);
    setStored('moodie_preferences', data);
    return data;
  }
};

export default userService;
