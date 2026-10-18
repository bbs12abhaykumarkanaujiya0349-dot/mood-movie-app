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
  Filter
} from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import userService from '../services/userService';
import { MOODS } from '../constants/moods';
import { MOCK_MOVIES } from '../data/movies';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('All');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await userService.getHistory();
      setHistoryList(data);
    } catch (err) {
      toast.error('Failed to load mood history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await userService.clearHistory();
      setHistoryList([]);
      setIsConfirmOpen(false);
      toast.success('Mood history cleared successfully');
    } catch {
      toast.error('Failed to clear history');
    } finally {
      setIsClearing(false);
    }
  };

  const filteredHistory = historyList.filter((item) => {
    if (selectedMoodFilter === 'All') return true;
    return item.detectedMood?.toLowerCase() === selectedMoodFilter.toLowerCase();
  });

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

          {historyList.length > 0 && (
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
        {historyList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs text-slate-400 font-semibold mr-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter by Mood:
            </span>
            {['All', ...MOODS.map((m) => m.label)].map((moodLabel) => (
              <button
                key={moodLabel}
                type="button"
                onClick={() => setSelectedMoodFilter(moodLabel)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedMoodFilter === moodLabel
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-[#121520] text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {moodLabel}
              </button>
            ))}
          </div>
        )}

        {/* Timeline / List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton count={4} height="120px" className="rounded-2xl" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon={Brain}
            title={historyList.length === 0 ? 'No Mood History Recorded' : 'No entries for this mood'}
            description={
              historyList.length === 0
                ? 'Use our Natural Language Mood Matcher to analyze your feelings and record your recommendation journeys.'
                : 'Try selecting a different mood filter or running a new mood assessment.'
            }
            actionLabel={historyList.length === 0 ? 'Try Mood Matcher' : 'Reset Filter'}
            onAction={() =>
              historyList.length === 0
                ? window.location.assign('/mood')
                : setSelectedMoodFilter('All')
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const moodObj = MOODS.find(
                (m) =>
                  m.id === item.moodId ||
                  m.label.toLowerCase() === item.detectedMood?.toLowerCase()
              ) || MOODS[0];

              const moviePreviews = (item.recommendedMovieIds || ['m1', 'm2', 'm6'])
                .map((id) => MOCK_MOVIES.find((m) => m.id === id))
                .filter(Boolean)
                .slice(0, 3);

              return (
                <div
                  key={item.id}
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

                    {/* Recommend Again button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/recommendations?mood=${moodObj.id}&query=${encodeURIComponent(
                            item.inputText
                          )}`
                        )
                      }
                      leftIcon={RotateCcw}
                    >
                      Recommend Again
                    </Button>
                  </div>

                  {/* Prompt Text & Confidence bar */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-200 italic font-medium">
                      "{item.inputText}"
                    </p>

                    {item.confidence && (
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
                        {moviePreviews.map((m) => (
                          <Link
                            key={m.id}
                            to={`/movie/${m.id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>{m.title}</span>
                            <span className="text-amber-400 text-[10px]">★{m.rating}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
