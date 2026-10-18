import api from './api';
import { MOCK_USERS } from '../data/users';
import { MOCK_REVIEWS } from '../data/reviews';
import { MOCK_MOVIES } from '../data/movies';
import { ANALYTICS_DATA } from '../data/analytics';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory mock stores initialized from data files
let usersStore = [...MOCK_USERS];
let reviewsStore = [...MOCK_REVIEWS];
let moviesStore = [...MOCK_MOVIES];

export const adminService = {
  /**
   * Get KPI statistics and charts for dashboard
   * MOCK: replace with real API in integration step -> return (await api.get('/admin/stats', { params: { range } })).data;
   */
  async getDashboardStats(range = '7d') {
    await delay(350);
    const data = ANALYTICS_DATA[range] || ANALYTICS_DATA['7d'];
    return {
      ...data,
      kpis: {
        ...data.kpis,
        totalUsers: { ...data.kpis.totalUsers, value: usersStore.length },
        totalMovies: { ...data.kpis.totalMovies, value: moviesStore.length },
        totalReviews: { ...data.kpis.totalReviews, value: reviewsStore.length }
      }
    };
  },

  /**
   * Get user management table with search and filtering
   * MOCK: replace with real API in integration step -> return (await api.get('/admin/users', { params })).data;
   */
  async getUsers(params = {}) {
    await delay(400);
    const { search = '', role = 'All', status = 'All', page = 1, limit = 8 } = params;

    let results = [...usersStore];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    if (role !== 'All') {
      results = results.filter((u) => u.role === role);
    }

    if (status !== 'All') {
      results = results.filter((u) => u.status === status);
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return {
      users: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  /**
   * Block a user account
   * MOCK: replace with real API in integration step -> return (await api.put(`/admin/users/${id}/block`)).data;
   */
  async blockUser(id) {
    await delay(300);
    usersStore = usersStore.map((u) => (u.id === id ? { ...u, status: 'blocked' } : u));
    return { success: true };
  },

  /**
   * Unblock a user account
   * MOCK: replace with real API in integration step -> return (await api.put(`/admin/users/${id}/unblock`)).data;
   */
  async unblockUser(id) {
    await delay(300);
    usersStore = usersStore.map((u) => (u.id === id ? { ...u, status: 'active' } : u));
    return { success: true };
  },

  /**
   * Delete a user account
   * MOCK: replace with real API in integration step -> return (await api.delete(`/admin/users/${id}`)).data;
   */
  async deleteUser(id) {
    await delay(350);
    usersStore = usersStore.filter((u) => u.id !== id);
    return { success: true };
  },

  /**
   * Get review moderation list
   * MOCK: replace with real API in integration step -> return (await api.get('/admin/reviews', { params })).data;
   */
  async getReviews(params = {}) {
    await delay(400);
    const { search = '', sentiment = 'All', status = 'All', page = 1, limit = 8 } = params;

    let results = [...reviewsStore];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.movieTitle.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      );
    }

    if (sentiment !== 'All') {
      results = results.filter((r) => r.sentiment === sentiment);
    }

    if (status !== 'All') {
      results = results.filter((r) => r.status === status);
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return {
      reviews: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  /**
   * Toggle review visibility (hide / unhide)
   * MOCK: replace with real API in integration step -> return (await api.put(`/admin/reviews/${id}/visibility`)).data;
   */
  async toggleReviewVisibility(id) {
    await delay(300);
    reviewsStore = reviewsStore.map((r) =>
      r.id === id ? { ...r, status: r.status === 'visible' ? 'hidden' : 'visible' } : r
    );
    return { success: true };
  },

  /**
   * Delete review
   * MOCK: replace with real API in integration step -> return (await api.delete(`/admin/reviews/${id}`)).data;
   */
  async deleteReview(id) {
    await delay(300);
    reviewsStore = reviewsStore.filter((r) => r.id !== id);
    return { success: true };
  },

  /**
   * Get movie catalog management list
   * MOCK: replace with real API in integration step -> return (await api.get('/admin/movies', { params })).data;
   */
  async getMovies(params = {}) {
    await delay(350);
    const { search = '', page = 1, limit = 8 } = params;

    let results = [...moviesStore];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (m) => m.title.toLowerCase().includes(q) || m.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return {
      movies: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  /**
   * Add movie to catalog
   * MOCK: replace with real API in integration step -> return (await api.post('/admin/movies', movieData)).data;
   */
  async addMovie(movieData) {
    await delay(450);
    const newMovie = {
      id: `m_${Date.now()}`,
      rating: parseFloat(movieData.rating) || 7.5,
      runtime: parseInt(movieData.runtime, 10) || 110,
      popularity: 85.0,
      posterUrl: '',
      backdropUrl: '',
      language: movieData.language || 'English',
      releaseDate: movieData.releaseDate || new Date().toISOString().split('T')[0],
      ...movieData
    };
    moviesStore.unshift(newMovie);
    return newMovie;
  },

  /**
   * Update movie in catalog
   * MOCK: replace with real API in integration step -> return (await api.put(`/admin/movies/${id}`, data)).data;
   */
  async updateMovie(id, data) {
    await delay(400);
    moviesStore = moviesStore.map((m) => (m.id === id ? { ...m, ...data } : m));
    return moviesStore.find((m) => m.id === id);
  },

  /**
   * Delete movie from catalog
   * MOCK: replace with real API in integration step -> return (await api.delete(`/admin/movies/${id}`)).data;
   */
  async deleteMovie(id) {
    await delay(350);
    moviesStore = moviesStore.filter((m) => m.id !== id);
    return { success: true };
  },

  /**
   * Get extended analytics dataset by range
   * MOCK: replace with real API in integration step -> return (await api.get('/admin/analytics', { params: { range } })).data;
   */
  async getAnalytics(range = '7d') {
    await delay(400);
    return ANALYTICS_DATA[range] || ANALYTICS_DATA['7d'];
  }
};

export default adminService;
