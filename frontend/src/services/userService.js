import api from './api';
import { mapMovie } from '../utils/movieMapper';

export const userService = {
  /**
   * Get authenticated user's watchlist
   * GET /api/watchlist
   */
  async getWatchlist() {
    const response = await api.get('/watchlist');
    const items = response.data.watchlist || [];
    return items.map(mapMovie);
  },

  /**
   * Add movie to watchlist
   * POST /api/watchlist
   */
  async addToWatchlist(movieId) {
    const id = typeof movieId === 'object' ? (movieId.externalMovieId || movieId.id || movieId._id) : movieId;
    const response = await api.post('/watchlist', { movieId: id });
    return response.data;
  },

  /**
   * Remove movie from watchlist
   * DELETE /api/watchlist/:id
   */
  async removeFromWatchlist(movieId) {
    const id = typeof movieId === 'object' ? (movieId.externalMovieId || movieId.id || movieId._id) : movieId;
    const response = await api.delete(`/watchlist/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Get authenticated user's favorites
   * GET /api/favorites
   */
  async getFavorites() {
    const response = await api.get('/favorites');
    const items = response.data.favorites || [];
    return items.map(mapMovie);
  },

  /**
   * Add movie to favorites
   * POST /api/favorites
   */
  async addToFavorites(movieId) {
    const id = typeof movieId === 'object' ? (movieId.externalMovieId || movieId.id || movieId._id) : movieId;
    const response = await api.post('/favorites', { movieId: id });
    return response.data;
  },

  /**
   * Remove movie from favorites
   * DELETE /api/favorites/:id
   */
  async removeFromFavorites(movieId) {
    const id = typeof movieId === 'object' ? (movieId.externalMovieId || movieId.id || movieId._id) : movieId;
    const response = await api.delete(`/favorites/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Get recommendation query history with optional mood filter and pagination
   * GET /api/history
   */
  async getHistory(params = {}) {
    const queryParams = {};
    if (params.mood && params.mood !== 'All') {
      queryParams.mood = params.mood;
    }
    if (params.page) {
      queryParams.page = Number(params.page);
    }
    if (params.limit) {
      queryParams.limit = Number(params.limit);
    }

    const response = await api.get('/history', { params: queryParams });
    const data = response.data;

    return {
      history: (data.history || []).map((h) => ({
        id: h._id,
        _id: h._id,
        inputText: h.inputText,
        detectedMood: h.detectedMood,
        confidence: h.confidence,
        recommendationIds: (h.recommendationIds || []).map(mapMovie),
        createdAt: h.createdAt
      })),
      total: data.totalResults ?? (data.history || []).length,
      page: data.page ?? 1,
      totalPages: data.totalPages ?? 1
    };
  },

  /**
   * Delete single history entry
   * DELETE /api/history/:id
   */
  async deleteHistoryItem(id) {
    const response = await api.delete(`/history/${encodeURIComponent(id)}`);
    return response.data;
  },

  /**
   * Clear all recommendation history for authenticated user
   * DELETE /api/history
   */
  async clearHistory() {
    const response = await api.delete('/history');
    return response.data;
  },

  /**
   * Get user profile metrics & stats
   * GET /api/users/me/stats
   */
  async getMyStats() {
    const response = await api.get('/users/me/stats');
    return response.data.stats || {
      watchlistCount: 0,
      favoritesCount: 0,
      reviewCount: 0,
      moodCheckCount: 0,
      memberSince: new Date().toISOString()
    };
  },

  /**
   * Update user display name
   * PATCH /api/auth/me
   */
  async updateProfile(data) {
    const response = await api.patch('/auth/me', data);
    return response.data.user;
  },

  /**
   * Change user password
   * PATCH /api/auth/password
   */
  async changePassword({ currentPassword, newPassword }) {
    const response = await api.patch('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  /**
   * Permanently delete user account with password confirmation
   * DELETE /api/users/me
   */
  async deleteAccount(password) {
    const response = await api.delete('/users/me', {
      data: { password }
    });
    return response.data;
  },

  /**
   * Get reviews created by current user
   * GET /api/reviews/me/list
   */
  async getUserReviews() {
    const response = await api.get('/reviews/me/list');
    const rawList = response.data.reviews || [];
    return rawList.map((r) => ({
      id: r._id,
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      sentiment: r.sentiment,
      status: r.status,
      movieTitle: r.movieId?.title || 'Unknown Film',
      movie: r.movieId ? mapMovie(r.movieId) : null,
      createdAt: r.createdAt
    }));
  },

  /**
   * Get user preferences (favorite genres, preferred language)
   * GET /api/auth/me
   */
  async getPreferences() {
    const response = await api.get('/auth/me');
    const user = response.data.user;
    return user?.preferences || {
      favoriteGenres: ['Sci-Fi', 'Comedy', 'Drama'],
      language: 'en'
    };
  },

  /**
   * Update user preferences
   * PATCH /api/users/me/preferences
   */
  async updatePreferences({ favoriteGenres, language }) {
    const payload = {};
    if (favoriteGenres !== undefined) {
      payload.favoriteGenres = favoriteGenres;
    }
    if (language !== undefined) {
      payload.language = language;
    }
    const response = await api.patch('/users/me/preferences', payload);
    return response.data.preferences;
  }
};

export default userService;
