import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Film, Bookmark, Clock } from 'lucide-react';
import { getMovieGradient, formatRuntime, getReleaseYear } from '../../utils/helpers';
import Badge from '../common/Badge';
import { useLibrary } from '../../context/LibraryContext';

export default function MovieCard({ movie, onWatchlistToggle, isSaved: isSavedProp }) {
  const [imageError, setImageError] = useState(false);
  const { id, title, releaseDate, genres = [], overview, posterUrl, rating, runtime } = movie;

  // Integrate with LibraryContext if props are not explicitly provided
  const library = useLibrary();
  const isSaved = isSavedProp !== undefined ? isSavedProp : library?.isWatchlisted(id);
  const handleToggle = onWatchlistToggle || (() => library?.toggleWatchlist(movie));

  const showPlaceholder = !posterUrl || posterUrl === 'N/A' || imageError;
  const gradientClass = getMovieGradient(title, genres[0]);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#12151f] border border-slate-800/80 hover:border-slate-700/80 shadow-lg shadow-black/40 hover:shadow-2xl hover:shadow-rose-500/10 transition-colors h-full"
    >
      {/* Poster or Gradient Placeholder Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0c0e15]">
        {showPlaceholder ? (
          <div
            className={`w-full h-full p-5 flex flex-col justify-between bg-gradient-to-br ${gradientClass} relative overflow-hidden`}
          >
            {/* Ambient decorative elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Top row */}
            <div className="flex items-center justify-between relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80">
                <Film className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating ? Number(rating).toFixed(1) : 'NR'}</span>
              </div>
            </div>

            {/* Center/Bottom Title display on Placeholder */}
            <div className="relative z-10 text-left">
              <span className="text-[11px] uppercase tracking-wider text-rose-300/80 font-medium block mb-1">
                {genres[0] || 'Cinema'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-2">
                <span>{getReleaseYear(releaseDate)}</span>
                {runtime && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatRuntime(runtime)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <img
              src={posterUrl}
              alt={title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Top Rating Badge */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating ? Number(rating).toFixed(1) : 'NR'}</span>
            </div>
          </>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
            {overview}
          </p>

          <div className="flex items-center gap-2">
            <Link
              to={`/movie/${id}`}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md shadow-rose-500/20 transition-all"
            >
              View Details
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle(movie);
              }}
              title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label={isSaved ? `Remove ${title} from Watchlist` : `Add ${title} to Watchlist`}
              className={`p-2 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                isSaved
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="p-4 flex flex-col justify-between flex-1 text-left">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="default" size="sm">
                {genre}
              </Badge>
            ))}
          </div>
          <Link to={`/movie/${id}`}>
            <h4 className="text-sm font-semibold text-slate-100 hover:text-rose-400 transition-colors line-clamp-1">
              {title}
            </h4>
          </Link>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-slate-800/80">
          <span>{getReleaseYear(releaseDate)}</span>
          <span className="font-medium text-slate-300 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {rating ? Number(rating).toFixed(1) : 'NR'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
