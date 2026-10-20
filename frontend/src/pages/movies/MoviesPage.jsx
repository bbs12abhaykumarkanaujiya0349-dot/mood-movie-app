import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Film,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import Container from '../../components/common/Container';
import MovieCard from '../../components/movie/MovieCard';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import movieService from '../../services/movieService';
import useDebounce from '../../hooks/useDebounce';

const GENRE_OPTIONS = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Drama',
  'Family',
  'Horror',
  'Inspirational',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sports',
  'Thriller'
];

const YEAR_OPTIONS = ['All', '2024', '2023', '2022', '2021', '2020'];
const RATING_OPTIONS = [
  { label: 'All Ratings', value: 'All' },
  { label: '★ 8.5 & Above', value: '8.5' },
  { label: '★ 8.0 & Above', value: '8.0' },
  { label: '★ 7.5 & Above', value: '7.5' }
];

const LANGUAGE_OPTIONS = ['All', 'English', 'Japanese'];

export default function MoviesPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMinRating, setSelectedMinRating] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedSort, setSelectedSort] = useState('popularity');

  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState('local');
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Fetch movies whenever filters change
  const fetchMovies = async (isNewPage = false) => {
    if (isNewPage) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await movieService.getMovies({
        search: debouncedSearch,
        genre: selectedGenre,
        year: selectedYear,
        minRating: selectedMinRating,
        language: selectedLanguage,
        sort: selectedSort,
        page: isNewPage ? page + 1 : 1,
        limit: 12
      });

      if (isNewPage) {
        setMovies((prev) => [...prev, ...data.movies]);
        setPage((p) => p + 1);
      } else {
        setMovies(data.movies);
        setPage(1);
      }

      setTotal(data.total);
      setSource(data.source || 'local');
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMovies(false);
  }, [
    debouncedSearch,
    selectedGenre,
    selectedYear,
    selectedMinRating,
    selectedLanguage,
    selectedSort
  ]);

  const clearFilters = () => {
    setSearchInput('');
    setSelectedGenre('All');
    setSelectedYear('All');
    setSelectedMinRating('All');
    setSelectedLanguage('All');
    setSelectedSort('popularity');
  };

  const hasActiveFilters =
    searchInput !== '' ||
    selectedGenre !== 'All' ||
    selectedYear !== 'All' ||
    selectedMinRating !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedSort !== 'popularity';

  const sourceBadgeLabel =
    source === 'omdb'
      ? 'Live: OMDb'
      : source === 'tmdb'
      ? 'Live: TMDb'
      : 'Demo data';

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="rose" size="md">
                FR-08: Movie Catalog & Discovery
              </Badge>
              <Badge
                variant={source === 'omdb' || source === 'tmdb' ? 'emerald' : 'default'}
                size="sm"
                dot
              >
                {sourceBadgeLabel}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Movie Catalog
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Explore curated films spanning diverse emotional tones, genres, and release years. Filter by criteria or search with instant debounce.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">{total}</span>
            <span>titles available</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-6 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-xl mb-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input with Debounce */}
            <div className="lg:col-span-2">
              <Input
                label="Search by Title or Overview"
                type="text"
                placeholder="Type movie keywords... (debounced 400ms)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={Search}
              />
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-[#12151f] text-slate-100 text-sm rounded-xl border border-slate-800 hover:border-slate-700 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g === 'All' ? 'All Genres' : g}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full bg-[#12151f] text-slate-100 text-sm rounded-xl border border-slate-800 hover:border-slate-700 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <option value="popularity">Most Popular First</option>
                <option value="rating">Highest IMDb Rating</option>
                <option value="newest">Newest Releases</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#12151f] text-slate-200 text-xs rounded-lg border border-slate-800 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Min Rating:</span>
                <select
                  value={selectedMinRating}
                  onChange={(e) => setSelectedMinRating(e.target.value)}
                  className="bg-[#12151f] text-slate-200 text-xs rounded-lg border border-slate-800 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {RATING_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-[#12151f] text-slate-200 text-xs rounded-lg border border-slate-800 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                leftIcon={RotateCcw}
              >
                Reset All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Content Section: Loading Skeletons, Error, Empty, or Movie Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#12151f] border border-slate-800 p-4 space-y-3"
              >
                <Skeleton height="320px" className="rounded-xl" />
                <Skeleton width="60%" height="20px" />
                <Skeleton width="90%" height="16px" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load movies"
            description={error}
            onRetry={() => fetchMovies(false)}
          />
        ) : movies.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No movies found"
            description="No movies matched your chosen filter combination. Try adjusting your search keywords or resetting filters."
            actionLabel="Reset All Filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => fetchMovies(true)}
                  isLoading={loadingMore}
                >
                  Load More Movies ({movies.length} of {total})
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
