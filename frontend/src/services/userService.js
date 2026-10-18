import api from './api';
import { MOCK_MOVIES } from '../data/movies';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

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
    await delay(250);
    return getStored('moodie_history', [
      {
        id: 'h1',
        inputText: 'Feeling worn out and need lighthearted hope',
        detectedMood: 'Happy',
        confidence: 0.92,
        date: new Date(Date.now() - 3600000).toLocaleString(),
        count: 8
      },
      {
        id: 'h2',
        inputText: 'Intense galactic thriller and sci-fi rush',
        detectedMood: 'Excited',
        confidence: 0.88,
        date: new Date(Date.now() - 86400000).toLocaleString(),
        count: 6
      }
    ]);
  },

  async addHistory(entry) {
    await delay(150);
    const history = getStored('moodie_history', []);
    const newEntry = {
      id: `h_${Date.now()}`,
      ...entry,
      date: new Date().toLocaleString()
    };
    history.unshift(newEntry);
    setStored('moodie_history', history);
    return newEntry;
  }
};

export default userService;
