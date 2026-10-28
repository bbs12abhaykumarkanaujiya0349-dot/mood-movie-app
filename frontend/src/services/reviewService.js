import api from './api';

export const reviewService = {
  /**
   * Get public reviews and summary for a movie
   * GET /api/reviews/:movieId
   */
  async getMovieReviews(movieId, params = {}) {
    if (!movieId) return { reviews: [], summary: { averageRating: 0, reviewCount: 0 } };
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/reviews/${encodeURIComponent(movieId)}`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Create review for a movie
   * POST /api/reviews
   */
  async createReview({ movieId, rating, comment }) {
    const response = await api.post('/reviews', {
      movieId,
      rating: Number(rating),
      comment: typeof comment === 'string' ? comment.trim() : ''
    });
    return response.data;
  },

  /**
   * Update existing review (owner only)
   * PATCH /api/reviews/:id
   */
  async updateReview(id, { rating, comment }) {
    const payload = {};
    if (rating !== undefined) payload.rating = Number(rating);
    if (comment !== undefined) payload.comment = typeof comment === 'string' ? comment.trim() : comment;

    const response = await api.patch(`/reviews/${id}`, payload);
    return response.data;
  },

  /**
   * Delete review (owner or admin)
   * DELETE /api/reviews/:id
   */
  async deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  /**
   * Get current user's submitted reviews
   * GET /api/reviews/me/list
   */
  async getMyReviews() {
    const response = await api.get('/reviews/me/list');
    return response.data.reviews || [];
  }
};

export default reviewService;
