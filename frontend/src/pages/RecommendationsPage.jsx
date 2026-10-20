import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Info,
  CheckCircle,
  Film,
  Zap,
  Sliders,
  Database
} from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import MovieCard from '../components/movie/MovieCard';
import moodService from '../services/moodService';
import { MOODS } from '../constants/moods';
import toast from 'react-hot-toast';

export default function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const moodId = searchParams.get('mood') || 'happy';
  const queryParam = searchParams.get('query');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const activeMood = MOODS.find((m) => m.id === moodId.toLowerCase()) || MOODS[0];

  const fetchRecommendations = async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        limit: 12,
        refresh: Boolean(isRefresh)
      };

      if (queryParam) {
        options.text = decodeURIComponent(queryParam);
      } else {
        options.mood =
          moodId.charAt(0).toUpperCase() + moodId.slice(1).toLowerCase();
      }

      const result = await moodService.getRecommendations(options);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [moodId, queryParam]);

  const handleRefresh = () => {
    toast.promise(fetchRecommendations(true), {
      loading: 'Reshuffling recommendations...',
      success: 'Recommendations refreshed!',
      error: 'Failed to refresh recommendations'
    });
  };

  const sourceLabel =
    data?.source === 'omdb'
      ? 'Live: OMDb'
      : data?.source === 'tmdb'
      ? 'Live: TMDb'
      : 'Demo data';

  const currentMoodLabel = data?.mood || activeMood.label;

  return (
    <div className="py-12 sm:py-16 text-left pb-24">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/mood">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
              Try Another Mood
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            leftIcon={RefreshCw}
          >
            Refresh
          </Button>
        </div>

        {/* Hero Header Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-[#0e111a] border border-rose-500/20 shadow-2xl mb-10 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="rose" size="md">
              FR-06: Mood Recommendation
            </Badge>

            {/* Subtle Data Source Badge */}
            {data?.source && (
              <Badge
                variant={data.source === 'omdb' || data.source === 'tmdb' ? 'emerald' : 'default'}
                size="md"
                dot
              >
                {sourceLabel}
              </Badge>
            )}

            {/* Real NLP Confidence & Method from Backend */}
            {data?.confidence !== undefined && (
              <Badge variant="cyan" size="md" dot>
                {Math.round(data.confidence * 100)}% Confidence ({data.method || 'rule-based'})
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Because you're feeling{' '}
            <span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
              {currentMoodLabel}
            </span>
          </h1>

          {queryParam && (
            <p className="text-xs sm:text-sm text-slate-300 italic">
              Based on your prompt: "{decodeURIComponent(queryParam)}"
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {activeMood.tagline}. Mapped to:{' '}
            <span className="text-slate-200 font-semibold">
              {activeMood.mappedGenres.join(', ')}
            </span>
            .
          </p>

          {/* Honest architectural note */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-400">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Algorithm Note:</strong> Rule-based recommendations powered by mood-to-genre mapping and IMDb popularity ranking per SRS Section 6 standards.
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#12151f] border border-slate-800 p-4 space-y-3"
              >
                <Skeleton height="320px" className="rounded-xl" />
                <Skeleton width="70%" height="20px" />
                <Skeleton width="40%" height="16px" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load recommendations"
            description={error}
            onRetry={() => fetchRecommendations(false)}
          />
        ) : !data || data.recommendations.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No matches found"
            description="We could not find films matching this specific mood query in our catalog."
            actionLabel="Try Another Mood"
            onAction={() => window.location.assign('/mood')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.recommendations.map((movie) => (
              <div key={movie.id} className="flex flex-col space-y-2">
                {/* Match Score & Real Backend Reason */}
                <div className="flex items-center justify-between text-xs px-2 pt-1 gap-2">
                  <Badge variant="amber" size="sm" dot>
                    {movie.matchScore}% Match
                  </Badge>
                  <span
                    className="text-[11px] text-slate-400 truncate max-w-[170px]"
                    title={movie.reason}
                  >
                    {movie.reason}
                  </span>
                </div>

                <div className="flex-1">
                  <MovieCard movie={movie} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
