import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar, Globe, Bookmark, Share2, Film, MessageSquare } from 'lucide-react';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { MOCK_MOVIES } from '../../data/movies';
import { getMovieGradient, formatRuntime, getReleaseYear } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);

  // Find matching movie or default to first
  const movie = MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
  const gradientClass = getMovieGradient(movie.title, movie.genres[0]);

  const toggleWatchlist = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from watchlist' : 'Added to watchlist');
  };

  return (
    <div className="py-8 sm:py-12 text-left">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link to="/movies">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
              Back to Movies
            </Button>
          </Link>
        </div>

        {/* Hero Backdrop Banner */}
        <div
          className={`relative rounded-3xl p-6 sm:p-12 overflow-hidden border border-slate-800 bg-gradient-to-br ${gradientClass} shadow-2xl mb-12`}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Visual Poster representation */}
            <div className="w-36 sm:w-52 aspect-[2/3] rounded-2xl bg-[#0a0b10]/80 border border-white/10 shadow-2xl flex flex-col items-center justify-center p-4 text-center shrink-0">
              <Film className="w-12 h-12 text-rose-400 mb-3" />
              <span className="text-xs font-bold text-white line-clamp-2">{movie.title}</span>
              <span className="text-[10px] text-slate-400 mt-1">{getReleaseYear(movie.releaseDate)}</span>
            </div>

            {/* Movie Info */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                {movie.genres.map((genre) => (
                  <Badge key={genre} variant="rose" size="sm">
                    {genre}
                  </Badge>
                ))}
                <Badge variant="amber" size="sm" dot>
                  {movie.language}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
                {movie.title}
              </h1>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 flex-wrap">
                <span className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {movie.rating} / 10 IMDb
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {formatRuntime(movie.runtime)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {movie.releaseDate}
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
                {movie.overview}
              </p>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant={isSaved ? 'secondary' : 'primary'}
                  size="md"
                  onClick={toggleWatchlist}
                  leftIcon={Bookmark}
                >
                  {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={Share2}
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs & Next Step Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-3">FR-07: Movie Specification</h3>
              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-slate-500 font-medium">Original Title</dt>
                  <dd className="text-slate-200 mt-0.5">{movie.title}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Runtime</dt>
                  <dd className="text-slate-200 mt-0.5">{formatRuntime(movie.runtime)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Primary Language</dt>
                  <dd className="text-slate-200 mt-0.5">{movie.language}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Popularity Score</dt>
                  <dd className="text-slate-200 mt-0.5">{movie.popularity} points</dd>
                </div>
              </dl>
            </div>

            {/* Reviews Section Placeholder */}
            <div className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-rose-400" />
                  <span>User Reviews & Ratings (FR-10)</span>
                </h3>
                <Badge variant="default" size="sm">Coming in Step F7</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review submissions, sentiment analysis, and star ratings will be wired in Step F7 once the Express backend Review routes are ready.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">Streaming & Availability</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                External TMDb provider links and legal streaming integrations are defined under future enhancements.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300">
                Fallback dataset active: Instant offline rendering enabled.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
