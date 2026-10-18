import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import MovieCard from '../components/movie/MovieCard';
import { MOCK_MOVIES } from '../data/movies';
import toast from 'react-hot-toast';

export default function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || 'Relaxed and peaceful evening';
  const [watchlist, setWatchlist] = useState([]);

  // Recommend top rated movies from mock data
  const recommendedMovies = MOCK_MOVIES.slice(0, 8);

  const handleWatchlistToggle = (movie) => {
    if (watchlist.includes(movie.id)) {
      setWatchlist(watchlist.filter((id) => id !== movie.id));
      toast.success(`Removed "${movie.title}"`);
    } else {
      setWatchlist([...watchlist, movie.id]);
      toast.success(`Saved "${movie.title}"`);
    }
  };

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        <div className="mb-8">
          <Link to="/mood">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
              Back to Mood Selector
            </Button>
          </Link>
        </div>

        <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-[#101320] border border-rose-500/20 shadow-2xl mb-12">
          <Badge variant="rose" size="md" className="mb-3">
            FR-06: AI Recommendation Engine
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Recommended For You
          </h1>
          <p className="text-sm text-slate-300">
            Analysis based on your input: <span className="text-amber-300 font-semibold italic">"{query}"</span>
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hybrid ranking active: Sentiment mapping + IMDb rating threshold applied.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onWatchlistToggle={handleWatchlistToggle}
              isSaved={watchlist.includes(movie.id)}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
