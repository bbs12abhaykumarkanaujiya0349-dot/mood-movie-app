import React, { useState } from 'react';
import { Bookmark, Film } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import MovieCard from '../components/movie/MovieCard';
import { MOCK_MOVIES } from '../data/movies';
import toast from 'react-hot-toast';

export default function WatchlistPage() {
  const [watchlistIds, setWatchlistIds] = useState(['m1', 'm3', 'm6', 'm9']);

  const savedMovies = MOCK_MOVIES.filter((m) => watchlistIds.includes(m.id));

  const handleRemove = (movie) => {
    setWatchlistIds(watchlistIds.filter((id) => id !== movie.id));
    toast.success(`Removed "${movie.title}" from watchlist`);
  };

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        <div className="mb-10">
          <Badge variant="rose" size="md" className="mb-3">
            FR-09: User Watchlist
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            My Watchlist
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Movies you saved to experience when the mood strikes.
          </p>
        </div>

        {savedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchlistToggle={handleRemove}
                isSaved={true}
              />
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
