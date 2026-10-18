import api from './api';
import { MOCK_MOVIES } from '../data/movies';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const movieService = {
  /**
   * Get movies with filtering, sorting, and pagination
   * MOCK: replace with real API in integration step -> return (await api.get('/movies', { params })).data;
   */
  async getMovies(params = {}) {
    await delay(400);

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

    let results = [...MOCK_MOVIES];

    // Search filter (title or overview)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q)
      );
    }

    // Genre filter
    if (genre && genre !== 'All') {
      results = results.filter((m) => m.genres.includes(genre));
    }

    // Year filter
    if (year && year !== 'All') {
      results = results.filter((m) => m.releaseDate.startsWith(String(year)));
    }

    // Min Rating filter
    if (minRating && minRating !== 'All') {
      const ratingThreshold = parseFloat(minRating);
      if (!isNaN(ratingThreshold)) {
        results = results.filter((m) => m.rating >= ratingThreshold);
      }
    }

    // Language filter
    if (language && language !== 'All') {
      results = results.filter(
        (m) => m.language.toLowerCase() === language.toLowerCase()
      );
    }

    // Sorting
    results.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'newest') return new Date(b.releaseDate) - new Date(a.releaseDate);
      // Default: popularity
      return b.popularity - a.popularity;
    });

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = results.slice(startIndex, startIndex + limit);

    return {
      movies: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: startIndex + limit < total
    };
  },

  /**
   * Get movie details by ID with extended cast, director, and trailer info
   * MOCK: replace with real API in integration step -> return (await api.get(`/movies/${id}`)).data;
   */
  async getMovieById(id) {
    await delay(350);

    const movie = MOCK_MOVIES.find((m) => m.id === id);
    if (!movie) {
      throw new Error(`Movie with ID "${id}" was not found.`);
    }

    // Enhance with mock director, cast, and trailer for rich details
    return {
      ...movie,
      director: 'Christopher Nolan / Sofia Coppola (Mock Directing)',
      cast: ['Cillian Vance', 'Elena Rostova', 'Marcus Thorne', 'Aria Chen'],
      tagline: 'When emotion shapes reality, every choice defines the universe.',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    };
  },

  /**
   * Get similar movies based on genres
   * MOCK: replace with real API in integration step -> return (await api.get(`/movies/${id}/similar`)).data;
   */
  async getSimilarMovies(id, genres = []) {
    await delay(300);

    const similar = MOCK_MOVIES.filter(
      (m) => m.id !== id && m.genres.some((g) => genres.includes(g))
    ).slice(0, 4);

    return similar;
  }
};

export default movieService;
