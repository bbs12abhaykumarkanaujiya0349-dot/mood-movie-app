import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Clock,
  Trash2,
  ArrowRight,
  Brain,
  RotateCcw,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import userService from '../services/userService';
import { MOODS } from '../constants/moods';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMoodFilter, setSelectedMoodFilter] = useState('All');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = async (targetPage = page, targetMood = selectedMoodFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getHistory({
        mood: targetMood === 'All' ? undefined : targetMood,
        page: targetPage,
        limit: 8
      });
      setHistoryList(data.history || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load mood history');
      toast.error('Failed to load mood history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(page, selectedMoodFilter);
  }, [page, selectedMoodFilter]);

  const handleFilterChange = (moodLabel) => {
    setSelectedMoodFilter(moodLabel);
    setPage(1);
  };

  const handleDeleteItem = async (itemId) => {
    setDeletingId(itemId);
    try {
      await userService.deleteHistoryItem(itemId);
      toast.success('History entry deleted');
      loadHistory(page, selectedMoodFilter);
    } catch (err) {
      toast.error(err.message || 'Failed to delete history entry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await userService.clearHistory();
      setHistoryList([]);
      setTotal(0);
      setPage(1);
      setTotalPages(1);
      setIsConfirmOpen(false);
      toast.success('Mood history cleared successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to clear history');
    } finally {
      setIsClearing(false);
    }
  };

  const handleRecommendAgain = (item) => {
    if (item.inputText && item.inputText !== 'Selected manually') {
      navigate(`/recommendations?query=${encodeURIComponent(item.inputText)}`);
    } else {
      const moodSlug = (item.detectedMood || 'happy').toLowerCase();
      navigate(`/recommendations?mood=${encodeURIComponent(moodSlug)}`);
    }
  };

  return (
    <div className="py-12 sm:py-16 text-left pb-24 space-y-8">
      <Container size="lg">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="purple" size="md" className="mb-3">
              FR-11: Recommendation Timeline
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Mood History
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Trace your emotional queries and recommendation sessions over time.
            </p>
          </div>

          {total > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              leftIcon={Trash2}
            >
              Clear All History
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs text-slate-400 font-semibold mr-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter by Mood:
          </span>
          {['All', ...MOODS.map((m) => m.label)].map((moodLabel) => (
            <button
              key={moodLabel}
              type="button"
              onClick={() => handleFilterChange(moodLabel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedMoodFilter === moodLabel
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                  : 'bg-[#121520] text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {moodLabel}
            </button>
          ))}
        </div>

        {/* Timeline / List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton count={4} height="120px" className="rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load History"
            description={error}
            onRetry={() => loadHistory(page, selectedMoodFilter)}
          />
        ) : historyList.length === 0 ? (
          <EmptyState
            icon={Brain}
            title={selectedMoodFilter === 'All' ? 'No Mood History Recorded' : `No ${selectedMoodFilter} Entries`}
            description={
              selectedMoodFilter === 'All'
                ? 'Use our Natural Language Mood Matcher to analyze your feelings and record your recommendation journeys.'
                : 'Try selecting a different mood filter or running a new mood assessment.'
            }
            actionLabel={selectedMoodFilter === 'All' ? 'Try Mood Matcher' : 'Reset Filter'}
            onAction={() =>
              selectedMoodFilter === 'All'
                ? navigate('/mood')
                : handleFilterChange('All')
            }
          />
        ) : (
          <div className="space-y-4">
            {historyList.map((item) => {
              const itemId = item.id || item._id;
              const moodObj = MOODS.find(
                (m) =>
                  m.id === item.moodId ||
                  m.label.toLowerCase() === item.detectedMood?.toLowerCase()
              ) || MOODS[0];

              const moviePreviews = (item.recommendationIds || []).slice(0, 4);

              return (
                <div
                  key={itemId}
                  className="p-6 rounded-3xl bg-[#11141e]/90 border border-slate-800/90 shadow-lg hover:border-slate-700/80 transition-all text-left space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                        style={{ backgroundColor: `${moodObj.accentColor}25` }}
                      >
                        <span style={{ color: moodObj.accentColor }}>●</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="rose" size="sm">
                            {item.detectedMood} Cinema
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}{' '}
                            {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Recommend Again button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRecommendAgain(item)}
                        leftIcon={RotateCcw}
                      >
                        Recommend Again
                      </Button>

                      {/* Delete single history entry */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(itemId)}
                        isLoading={deletingId === itemId}
                        className="text-red-400 hover:text-red-300"
                        title="Delete this history entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Prompt Text & Confidence bar */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-200 italic font-medium">
                      "{item.inputText}"
                    </p>

                    {item.confidence !== undefined && (
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>NLP Confidence:</span>
                        <div className="w-32 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${Math.round(item.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-bold">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail / Title Previews of Recommended Movies */}
                  {moviePreviews.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">
                        Matched Recommendations Preview:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {moviePreviews.map((m) => {
                          const mId = m.externalMovieId || m.externalId || m.id || m._id;
                          return (
                            <Link
                              key={mId}
                              to={`/movie/${mId}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              <span>{m.title}</span>
                              {m.rating && <span className="text-amber-400 text-[10px]">★{m.rating}</span>}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Page {page} of {totalPages} ({total} entries total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                leftIcon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                rightIcon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Clear History Confirm Dialog */}
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Clear Mood History"
          message="Are you sure you want to permanently clear all your past mood assessment sessions? This action cannot be reversed."
          confirmText="Yes, Clear All"
          confirmVariant="danger"
          isLoading={isClearing}
          onConfirm={handleClearHistory}
          onClose={() => setIsConfirmOpen(false)}
        />
      </Container>
    </div>
  );
}
