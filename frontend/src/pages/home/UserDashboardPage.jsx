import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Bookmark,
  Heart,
  ArrowRight,
  Film,
  Compass,
  Star,
  Clock
} from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import MovieCard from '../../components/movie/MovieCard';
import useAuth from '../../hooks/useAuth';
import { useLibrary } from '../../context/LibraryContext';
import { MOODS } from '../../constants/moods';
import movieService from '../../services/movieService';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { watchlist } = useLibrary();
  const navigate = useNavigate();

  const [trendingMovies, setTrendingMovies] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true;
    movieService.getTrending().then((res) => {
      if (isMounted && res.results) {
        setTrendingMovies(res.results.slice(0, 8));
      }
    }).catch((err) => {
      console.warn('[UserDashboard] Failed to fetch trending:', err.message);
    });
    return () => { isMounted = false; };
  }, []);

  const watchlistMovies = watchlist || [];

  return (
    <div className="py-10 sm:py-14 text-left space-y-14 pb-24">
      <Container>
        {/* Welcome Header */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-[#0e111a] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="rose" size="md">
                Personalized Dashboard
              </Badge>
              <Badge variant="amber" size="sm" dot>
                {user?.role?.toLowerCase() === 'admin' ? 'Administrator' : 'Standard Member'}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                {user?.name || 'Explorer'}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              Ready for your next emotional cinema escape? Tell us how you feel today or dive into your personal watchlist.
            </p>

            <div className="flex items-center gap-3 pt-3 flex-wrap">
              <Link to="/mood">
                <Button variant="primary" size="md" leftIcon={Zap}>
                  Match Today's Mood
                </Button>
              </Link>
              <Link to="/movies">
                <Button variant="secondary" size="md" leftIcon={Compass}>
                  Explore All Movies
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Mood Picker Strip */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Quick Mood Selection</span>
            </h2>
            <Link to="/mood" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1">
              <span>Full NLP Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => navigate(`/recommendations?mood=${mood.id}`)}
                className="p-3.5 rounded-2xl bg-[#12151f] hover:bg-[#181c2b] border border-slate-800 hover:border-slate-700 transition-all text-center group cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-md"
                  style={{ backgroundColor: `${mood.accentColor}25` }}
                >
                  <span className="text-base font-bold" style={{ color: mood.accentColor }}>
                    ●
                  </span>
                </div>
                <span className="text-xs font-bold text-white block group-hover:text-rose-300 transition-colors">
                  {mood.label}
                </span>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                  {mood.mappedGenres[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-rose-400" />
                <span>My Saved Watchlist</span>
              </h2>
              <Badge variant="default" size="sm">
                {watchlistMovies.length} saved
              </Badge>
            </div>
            <Link to="/watchlist" className="text-xs text-rose-400 hover:underline">
              View All Watchlist
            </Link>
          </div>

          {watchlistMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {watchlistMovies.slice(0, 4).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#11141e]/50 border border-dashed border-slate-800 text-center">
              <p className="text-xs text-slate-400 mb-3">
                Your watchlist is currently empty. Bookmark titles while browsing to see them here!
              </p>
              <Link to="/movies">
                <Button variant="secondary" size="sm">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Trending Cinema Carousel Row */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" />
              <span>Trending Across All Moods</span>
            </h2>
            <Link to="/movies" className="text-xs text-slate-400 hover:text-white">
              See 24+ titles →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
