import api from './api';
import { mapMovie } from '../utils/movieMapper';

export const movieService = {
  /**
   * Search movies with multi-attribute filtering, sorting, and pagination
   * GET /api/movies/search
   */
  async getMovies(params = {}) {
    const {
      search = '',
      genre = 'All',
      year = 'All',
      minRating = 'All',
      language = 'All',
      sort = 'popularity',
      page = 1,
      limit = 12
    } = params;

    const queryParams = {
      page: Number(page) || 1,
      limit: Number(limit) || 12
    };

    if (search && search.trim()) {
      queryParams.q = search.trim();
    }
    if (genre && genre !== 'All') {
      queryParams.genre = genre;
    }
    if (year && year !== 'All') {
      queryParams.year = year;
    }
    if (minRating && minRating !== 'All') {
      queryParams.minRating = Number(minRating);
    }
    if (language && language !== 'All') {
      queryParams.language = language;
    }
    if (sort) {
      queryParams.sort = sort;
    }

    const response = await api.get('/movies/search', { params: queryParams });
    const data = response.data;

    const rawList = data.results || [];
    const mappedMovies = rawList.map(mapMovie);

    return {
      movies: mappedMovies,
      total: data.totalResults ?? mappedMovies.length,
      page: data.page ?? page,
      limit,
      totalPages:
        data.totalPages ??
        (Math.ceil((data.totalResults || mappedMovies.length) / limit) || 1),
      hasMore: (data.page || page) < (data.totalPages || 1),
      source: data.source || 'local'
    };
  },

  /**
   * Fetch complete movie metadata by IMDb externalId or Mongo ID
   * GET /api/movies/:id
   */
  async getMovieById(id) {
    if (!id) {
      throw new Error('A movie ID is required');
    }

    const response = await api.get(`/movies/${encodeURIComponent(id)}`);
    const data = response.data;

    const movieData = data.movie || data;
    return mapMovie({
      ...movieData,
      source: data.source || movieData.source
    });
  },

  /**
   * Fetch similar movies sharing genres with the specified movie
   * GET /api/movies/:id/similar
   */
  async getSimilarMovies(id, genres = []) {
    if (!id) return [];

    try {
      const response = await api.get(`/movies/${encodeURIComponent(id)}/similar`);
      const results = response.data.results || [];
      return results.map(mapMovie);
    } catch (err) {
      console.warn(`[movieService] Similar movies fetch failed for ID "${id}":`, err.message);
      return [];
    }
  },

  /**
   * Fetch trending movies
   * GET /api/movies/trending
   */
  async getTrending(page = 1) {
    const response = await api.get('/movies/trending', { params: { page } });
    const data = response.data;
    return {
      ...data,
      results: (data.results || []).map(mapMovie)
    };
  },

  /**
   * Fetch popular movies
   * GET /api/movies/popular
   */
  async getPopular(page = 1) {
    const response = await api.get('/movies/popular', { params: { page } });
    const data = response.data;
    return {
      ...data,
      results: (data.results || []).map(mapMovie)
    };
  },

  /**
   * Fetch recognized movie genres
   * GET /api/movies/genres
   */
  async getGenres() {
    const response = await api.get('/movies/genres');
    return response.data.genres || [];
  }
};

export default movieService;
