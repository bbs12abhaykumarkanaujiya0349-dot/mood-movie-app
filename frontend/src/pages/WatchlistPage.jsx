import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film, Trash2, ArrowLeft } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import MovieCard from '../components/movie/MovieCard';
import { useLibrary } from '../context/LibraryContext';
import { MOCK_MOVIES } from '../data/movies';

export default function WatchlistPage() {
  const { watchlist, toggleWatchlist } = useLibrary();

  const savedMovies = MOCK_MOVIES.filter((m) => watchlist.includes(m.id));

  return (
    <div className="py-12 sm:py-16 text-left pb-24">
      <Container>
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="rose" size="md" className="mb-3">
              FR-09: Watchlist
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              My Watchlist
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Movies you bookmarked to experience when the mood strikes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">{savedMovies.length}</span>
            <span>saved titles</span>
          </div>
        </div>

        {savedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedMovies.map((movie) => (
              <div key={movie.id} className="relative group">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Your Watchlist is Empty"
            description="Explore movies across our mood collections and bookmark them for your next movie night."
            actionLabel="Discover Movies"
            onAction={() => window.location.assign('/movies')}
          />
        )}
      </Container>
    </div>
  );
}
