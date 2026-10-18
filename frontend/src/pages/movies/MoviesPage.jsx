import React, { useState } from 'react';
import { Search, SlidersHorizontal, Film } from 'lucide-react';
import Container from '../../components/common/Container';
import MovieCard from '../../components/movie/MovieCard';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { MOCK_MOVIES } from '../../data/movies';
import toast from 'react-hot-toast';

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [watchlist, setWatchlist] = useState([]);

  // Extract unique genres across all movies
  const allGenres = ['All', ...new Set(MOCK_MOVIES.flatMap((m) => m.genres))];

  const handleWatchlistToggle = (movie) => {
    if (watchlist.includes(movie.id)) {
      setWatchlist(watchlist.filter((id) => id !== movie.id));
      toast.success(`Removed "${movie.title}" from watchlist`);
    } else {
      setWatchlist([...watchlist, movie.id]);
      toast.success(`Added "${movie.title}" to watchlist`);
    }
  };

  const filteredMovies = MOCK_MOVIES.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === 'All' || movie.genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        {/* Header */}
        <div className="mb-10">
          <Badge variant="rose" size="md" className="mb-3">
            FR-08: Movie Catalog & Search
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Explore All Movies
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Browse our mock catalog of 24+ movies spanning diverse emotional categories and genres.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="w-full md:w-96">
            <Input
              type="text"
              placeholder="Search by title, overview..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          {/* Genre Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 no-scrollbar">
            {allGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedGenre === genre
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-[#121520] text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchlistToggle={handleWatchlistToggle}
                isSaved={watchlist.includes(movie.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Film}
            title="No movies found"
            description={`No movies matched your search query "${searchQuery}" in genre "${selectedGenre}".`}
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedGenre('All');
            }}
          />
        )}
      </Container>
    </div>
  );
}
