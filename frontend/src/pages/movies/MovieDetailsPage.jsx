import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Globe,
  Bookmark,
  Heart,
  Share2,
  Film,
  Play,
  User,
  Sparkles,
  Video
} from 'lucide-react';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import MovieCard from '../../components/movie/MovieCard';
import ReviewForm from '../../components/review/ReviewForm';
import ReviewList from '../../components/review/ReviewList';
import movieService from '../../services/movieService';
import { useLibrary } from '../../context/LibraryContext';
import useAuth from '../../hooks/useAuth';
import { getMovieGradient, formatRuntime, getReleaseYear } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const { isWatchlisted, toggleWatchlist, isFavorite, toggleFavorite } = useLibrary();
  const { user, isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews state (local mock storage)
  const [reviews, setReviews] = useState([
    {
      id: 'rev_1',
      userId: 'mock_demo_user',
      userName: 'Elena Chen',
      rating: 9,
      comment: 'The emotional pacing was breathtaking. The soundtrack carried the entire narrative to new heights.',
      date: '2 days ago'
    },
    {
      id: 'rev_2',
      userId: 'mock_critic',
      userName: 'Marcus Sterling',
      rating: 8,
      comment: 'A magnificent cinematic exploration of isolation and triumph. Highly recommended for a thoughtful evening.',
      date: '1 week ago'
    }
  ]);

  const loadMovieDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await movieService.getMovieById(id);
      setMovie(data);

      const similar = await movieService.getSimilarMovies(id, data.genres);
      setSimilarMovies(similar);
    } catch (err) {
      setError(err.message || 'Movie not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovieDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddReview = (newReviewData) => {
    const newRev = {
      id: `rev_${Date.now()}`,
      userId: user?.id || 'guest_user',
      userName: user?.name || 'You (Verified Reviewer)',
      rating: newReviewData.rating,
      comment: newReviewData.comment,
      date: 'Just now'
    };
    setReviews([newRev, ...reviews]);
    toast.success('Your review has been posted!');
  };

  const handleEditReview = (reviewId, updatedData) => {
    setReviews(
      reviews.map((r) => (r.id === reviewId ? { ...r, ...updatedData } : r))
    );
    toast.success('Review updated!');
  };

  const handleDeleteReview = (reviewId) => {
    setReviews(reviews.filter((r) => r.id !== reviewId));
    toast.success('Review deleted.');
  };

  if (loading) {
    return (
      <div className="py-12 sm:py-16 text-left">
        <Container>
          <div className="space-y-8">
            <Skeleton width="140px" height="36px" className="rounded-xl" />
            <Skeleton height="380px" className="rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Skeleton count={3} height="120px" className="rounded-2xl md:col-span-2" />
              <Skeleton height="300px" className="rounded-2xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="py-20 text-center">
        <Container size="sm">
          <ErrorState
            title="Movie not found"
            description={error || `Could not find movie details for ID "${id}".`}
            onRetry={loadMovieDetails}
          />
          <div className="mt-6">
            <Link to="/movies">
              <Button variant="secondary" size="md" leftIcon={ArrowLeft}>
                Back to All Movies
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const inWatchlist = isWatchlisted(movie.id);
  const inFavorites = isFavorite(movie.id);
  const gradientClass = getMovieGradient(movie.title, movie.genres[0]);

  return (
    <div className="py-8 sm:py-12 text-left space-y-12 pb-24">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link to="/movies">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
              Back to Movies Catalog
            </Button>
          </Link>
        </div>

        {/* Hero Cinematic Backdrop & Header */}
        <div
          className={`relative rounded-3xl p-6 sm:p-12 overflow-hidden border border-slate-800 bg-gradient-to-br ${gradientClass} shadow-2xl`}
        >
          {/* Ambient overlays */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Visual Poster representation */}
            <div className="w-36 sm:w-56 aspect-[2/3] rounded-2xl bg-[#0a0b10]/90 border border-white/10 shadow-2xl flex flex-col items-center justify-between p-4 text-center shrink-0">
              <div className="w-full flex justify-between items-center text-slate-400">
                <Film className="w-5 h-5 text-rose-400" />
                <span className="text-[10px] font-bold uppercase">{movie.genres[0]}</span>
              </div>
              <div className="my-auto py-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-3">
                  {movie.title}
                </h3>
              </div>
              <div className="w-full pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>{getReleaseYear(movie.releaseDate)}</span>
                <span className="text-amber-400 font-bold">★ {movie.rating}</span>
              </div>
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

              {movie.tagline && (
                <p className="text-xs sm:text-sm text-amber-300/90 italic font-medium">
                  "{movie.tagline}"
                </p>
              )}

              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 flex-wrap pt-1">
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

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed pt-2">
                {movie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 flex-wrap">
                <Button
                  variant={inWatchlist ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => toggleWatchlist(movie)}
                  leftIcon={Bookmark}
                >
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>

                <Button
                  variant={inFavorites ? 'secondary' : 'ghost'}
                  size="md"
                  onClick={() => toggleFavorite(movie)}
                  leftIcon={Heart}
                  className={inFavorites ? 'text-rose-400 border-rose-500/40' : ''}
                >
                  {inFavorites ? 'Favorited' : 'Favorite'}
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={Share2}
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Movie link copied to clipboard!');
                  }}
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid & Trailer Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Cast & Crew Specification */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e]/90 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>Cast & Production Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-semibold block mb-1">
                    Director
                  </span>
                  <span className="text-slate-100 font-medium text-sm">
                    {movie.director}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 uppercase font-semibold block mb-1">
                    Popularity Score
                  </span>
                  <span className="text-slate-100 font-medium text-sm">
                    {movie.popularity} points
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-500 uppercase font-semibold block mb-2">
                    Key Cast Members
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast?.map((actor) => (
                      <Badge key={actor} variant="default" size="md">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trailer Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e]/90 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-400" />
                <span>Cinematic Trailer</span>
              </h3>
              <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-6 text-center group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl group-hover:scale-110 transition-transform mb-3">
                  <Play className="w-7 h-7 fill-rose-400 ml-1" />
                </div>
                <h4 className="text-sm font-bold text-white">Official Teaser & Preview</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  External trailer embed ready for TMDb video key integration.
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e]/90 border border-slate-800 space-y-8">
              <ReviewForm onSubmit={handleAddReview} />
              <ReviewList
                reviews={reviews}
                currentUserId={user?.id || 'guest_user'}
                onEditReview={handleEditReview}
                onDeleteReview={handleDeleteReview}
              />
            </div>
          </div>

          {/* Right Column: Similar Movies Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#11141e]/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Similar Movies</span>
                </h3>
                <span className="text-[10px] text-slate-400">By Shared Genres</span>
              </div>

              <div className="space-y-4 pt-1">
                {similarMovies.map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/movie/${similar.id}`}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
                  >
                    <div className="w-12 h-16 rounded-xl bg-gradient-to-br from-rose-950 to-slate-900 flex items-center justify-center text-white shrink-0 border border-slate-700/60">
                      <Film className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-left truncate">
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                        {similar.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{getReleaseYear(similar.releaseDate)}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">★ {similar.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                        {similar.genres.join(', ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
