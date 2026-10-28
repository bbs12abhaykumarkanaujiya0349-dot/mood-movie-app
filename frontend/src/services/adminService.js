import api from './api';
import { mapMovie } from '../utils/movieMapper';

const MOOD_COLORS = {
  Happy: '#fbbf24',
  Sad: '#60a5fa',
  Romantic: '#f43f5e',
  Angry: '#ef4444',
  Excited: '#f97316',
  Relaxed: '#34d399',
  Fearful: '#a855f7',
  Motivated: '#06b6d4'
};

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#f43f5e'
};

/**
 * Format raw analytics response into UI-ready chart shapes
 */
function mapAnalyticsData(overview, charts) {
  const kpis = {
    totalUsers: {
      value: overview.totalUsers ?? 0,
      change: 'Registered'
    },
    totalMovies: {
      value: overview.totalMovies ?? 0,
      change: 'In catalog'
    },
    totalReviews: {
      value: overview.totalReviews ?? 0,
      change: 'Community'
    },
    totalRecommendations: {
      value: overview.totalRecommendations ?? 0,
      change: 'Sessions run'
    },
    activeUsers: {
      value: overview.activeUsers ?? 0,
      change: 'Past 7 days'
    },
    popularMood: {
      value: overview.popularMood || 'Happy',
      change: 'Top queried'
    }
  };

  // Map user growth time series
  const userGrowth = (charts.userGrowth || []).map((item) => ({
    date: item.date,
    users: item.count,
    active: Math.max(0, item.count)
  }));

  // Map mood distribution for pie charts
  const rawMoods = charts.moodDistribution || [];
  const totalMoodCount = rawMoods.reduce((sum, m) => sum + (m.count || 0), 0) || 1;
  const moodDistribution = rawMoods.map((m) => ({
    name: m.mood,
    value: Math.round(((m.count || 0) / totalMoodCount) * 100),
    count: m.count,
    color: MOOD_COLORS[m.mood] || '#f43f5e'
  }));

  // Popular genres
  const popularGenres = charts.popularGenres || [];

  // Most reviewed movies
  const mostReviewedMovies = (charts.mostReviewedMovies || []).map((m) => ({
    title: m.title,
    reviews: m.reviewCount,
    avgRating: m.averageRating !== undefined ? m.averageRating : 0
  }));

  // User activity time series
  const userActivity = (charts.userActivity || []).map((item) => ({
    date: item.date,
    time: item.date,
    queries: (item.recommendations || 0) + (item.reviews || 0),
    recommendations: item.recommendations || 0,
    reviews: item.reviews || 0
  }));

  // Sentiment breakdown for donut chart
  const rawSentiments = charts.sentimentBreakdown || [];
  const totalSentimentCount = rawSentiments.reduce((sum, s) => sum + (s.count || 0), 0) || 1;
  const sentimentBreakdown = rawSentiments.map((s) => ({
    name: s.sentiment.charAt(0).toUpperCase() + s.sentiment.slice(1),
    value: Math.round(((s.count || 0) / totalSentimentCount) * 100),
    count: s.count,
    color: SENTIMENT_COLORS[s.sentiment] || '#fbbf24'
  }));

  return {
    kpis,
    userGrowth,
    moodDistribution,
    popularGenres,
    mostReviewedMovies,
    userActivity,
    sentimentBreakdown,
    topRatedMovies: charts.topRatedMovies || []
  };
}

export const adminService = {
  /**
   * Get KPI statistics and charts for dashboard
   * GET /api/admin/analytics/overview & /api/admin/analytics/charts?range=7d
   */
  async getDashboardStats(range = '7d') {
    const [overviewRes, chartsRes] = await Promise.all([
      api.get('/admin/analytics/overview'),
      api.get('/admin/analytics/charts', { params: { range } })
    ]);

    return mapAnalyticsData(overviewRes.data, chartsRes.data);
  },

  /**
   * Get extended analytics dataset by range
   * GET /api/admin/analytics/charts?range=7d|30d|90d
   */
  async getAnalytics(range = '7d') {
    const [overviewRes, chartsRes] = await Promise.all([
      api.get('/admin/analytics/overview'),
      api.get('/admin/analytics/charts', { params: { range } })
    ]);

    return mapAnalyticsData(overviewRes.data, chartsRes.data);
  },

  /**
   * Get user management table with search and filtering
   * GET /api/admin/users
   */
  async getUsers(params = {}) {
    const { search = '', role = 'All', status = 'All', page = 1, limit = 8 } = params;

    const queryParams = {
      page: Number(page) || 1,
      limit: Number(limit) || 8
    };

    if (search && search.trim()) {
      queryParams.search = search.trim();
    }
    if (role && role !== 'All') {
      queryParams.role = role.toUpperCase();
    }
    if (status && status !== 'All') {
      queryParams.status = status.toLowerCase();
    }

    const response = await api.get('/admin/users', { params: queryParams });
    const data = response.data;

    return {
      users: (data.users || []).map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        lastActive: u.lastActive,
        createdAt: u.createdAt
      })),
      total: data.total || 0,
      page: data.page || page,
      limit: queryParams.limit,
      totalPages: data.totalPages || 1
    };
  },

  /**
   * Update user status (active | blocked)
   * PATCH /api/admin/users/:id/status
   */
  async updateUserStatus(id, status) {
    const response = await api.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  /**
   * Block a user account
   */
  async blockUser(id) {
    return this.updateUserStatus(id, 'blocked');
  },

  /**
   * Unblock a user account
   */
  async unblockUser(id) {
    return this.updateUserStatus(id, 'active');
  },

  /**
   * Update user role (USER | ADMIN)
   * PATCH /api/admin/users/:id/role
   */
  async updateUserRole(id, role) {
    const response = await api.patch(`/admin/users/${id}/role`, {
      role: role.toUpperCase()
    });
    return response.data;
  },

  /**
   * Delete a user account (cascading reviews and history)
   * DELETE /api/admin/users/:id
   */
  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Get review moderation list
   * GET /api/admin/reviews
   */
  async getReviews(params = {}) {
    const { search = '', sentiment = 'All', status = 'All', page = 1, limit = 8 } = params;

    const queryParams = {
      page: Number(page) || 1,
      limit: Number(limit) || 8
    };

    if (search && search.trim()) {
      queryParams.search = search.trim();
    }
    if (sentiment && sentiment !== 'All') {
      queryParams.sentiment = sentiment.toLowerCase();
    }
    if (status && status !== 'All') {
      queryParams.status = status.toLowerCase();
    }

    const response = await api.get('/admin/reviews', { params: queryParams });
    const data = response.data;

    return {
      reviews: (data.reviews || []).map((r) => ({
        id: r._id,
        _id: r._id,
        userId: r.userId?._id || r.userId?.id || r.userId,
        userName: r.userId?.name || 'Anonymous User',
        userEmail: r.userId?.email || '',
        movieTitle: r.movieId?.title || 'Unknown Title',
        movieId: r.movieId?._id || r.movieId?.externalMovieId,
        rating: r.rating,
        comment: r.comment,
        sentiment: r.sentiment,
        status: r.status,
        createdAt: r.createdAt
      })),
      total: data.total || 0,
      page: data.page || page,
      limit: queryParams.limit,
      totalPages: data.totalPages || 1
    };
  },

  /**
   * Update review status (visible | hidden)
   * PATCH /api/admin/reviews/:id/status
   */
  async updateReviewStatus(id, status) {
    const response = await api.patch(`/admin/reviews/${id}/status`, { status });
    return response.data;
  },

  /**
   * Toggle review visibility (hide / unhide)
   */
  async toggleReviewVisibility(id, currentStatus) {
    const targetStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
    return this.updateReviewStatus(id, targetStatus);
  },

  /**
   * Permanently delete review
   * DELETE /api/admin/reviews/:id
   */
  async deleteReview(id) {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  /**
   * Get movie catalog management list
   * GET /api/admin/movies
   */
  async getMovies(params = {}) {
    const { search = '', page = 1, limit = 8 } = params;

    const queryParams = {
      page: Number(page) || 1,
      limit: Number(limit) || 8
    };

    if (search && search.trim()) {
      queryParams.search = search.trim();
    }

    const response = await api.get('/admin/movies', { params: queryParams });
    const data = response.data;

    return {
      movies: (data.movies || []).map(mapMovie),
      total: data.total || 0,
      page: data.page || page,
      limit: queryParams.limit,
      totalPages: data.totalPages || 1
    };
  },

  /**
   * Add movie to catalog
   * POST /api/admin/movies
   */
  async addMovie(movieData) {
    const payload = {
      title: movieData.title,
      genres: movieData.genres,
      releaseDate: movieData.releaseDate,
      overview: movieData.overview,
      posterUrl: movieData.posterUrl,
      backdropUrl: movieData.backdropUrl,
      rating: parseFloat(movieData.rating) || 7.5,
      runtime: parseInt(movieData.runtime, 10) || 110,
      language: movieData.language || 'en',
      director: movieData.director || '',
      cast: movieData.cast || []
    };

    const response = await api.post('/admin/movies', payload);
    return mapMovie(response.data.movie);
  },

  /**
   * Update movie in catalog
   * PATCH /api/admin/movies/:id
   */
  async updateMovie(id, data) {
    const payload = { ...data };
    if (payload.rating !== undefined) payload.rating = parseFloat(payload.rating);
    if (payload.runtime !== undefined) payload.runtime = parseInt(payload.runtime, 10);

    const response = await api.patch(`/admin/movies/${id}`, payload);
    return mapMovie(response.data.movie);
  },

  /**
   * Delete movie from catalog with cascade
   * DELETE /api/admin/movies/:id
   */
  async deleteMovie(id) {
    const response = await api.delete(`/admin/movies/${id}`);
    return response.data;
  }
};

export default adminService;
