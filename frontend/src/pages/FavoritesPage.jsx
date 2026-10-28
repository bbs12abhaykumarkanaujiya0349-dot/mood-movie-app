import React from 'react';
import { Heart, Film } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import MovieCard from '../components/movie/MovieCard';
import { useLibrary } from '../context/LibraryContext';

export default function FavoritesPage() {
  const { favorites, loading, error, refreshLibrary } = useLibrary();
  const favoriteMovies = favorites || [];

  return (
    <div className="py-12 sm:py-16 text-left pb-24">
      <Container>
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="rose" size="md" className="mb-3">
              Favorites Collection
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Favorite Movies
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Your highest-rated films and all-time personal favorites.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">{favoriteMovies.length}</span>
            <span>favorite titles</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#12151f] border border-slate-800 p-4 space-y-3">
                <Skeleton height="320px" className="rounded-xl" />
                <Skeleton width="70%" height="20px" />
                <Skeleton width="40%" height="16px" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load Favorites"
            description={error}
            onRetry={refreshLibrary}
          />
        ) : favoriteMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteMovies.map((movie) => (
              <MovieCard key={movie.id || movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="No Favorites Saved Yet"
            description="Mark films as your favorites from the Movie Details page to curate your personal hall of fame."
            actionLabel="Explore Movies"
            onAction={() => window.location.assign('/movies')}
          />
        )}
      </Container>
    </div>
  );
}
