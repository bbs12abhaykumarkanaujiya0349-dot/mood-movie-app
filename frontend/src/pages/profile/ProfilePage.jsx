import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Bookmark,
  Heart,
  MessageSquare,
  Sparkles,
  Edit2,
  Calendar,
  Check,
  X,
  History,
  Film,
  Star
} from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import MovieCard from '../../components/movie/MovieCard';
import useAuth from '../../hooks/useAuth';
import { useLibrary } from '../../context/LibraryContext';
import userService from '../../services/userService';
import { MOCK_MOVIES } from '../../data/movies';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { watchlist, favorites } = useLibrary();

  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'reviews' | 'recommended'
  const [loading, setLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  // Edit profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'Explorer');
  const [nameInput, setNameInput] = useState(user?.name || 'Explorer');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
      setNameInput(user.name);
    }
  }, [user]);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [historyData, reviewsData] = await Promise.all([
          userService.getHistory(),
          userService.getUserReviews()
        ]);
        setMoodHistory(historyData);
        setMyReviews(reviewsData);
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSavingName(true);
    try {
      await userService.updateProfile({ name: nameInput.trim() });
      setDisplayName(nameInput.trim());
      setIsEditingName(false);
      toast.success('Profile name updated!');
    } catch {
      toast.error('Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const userInitial = displayName ? displayName[0].toUpperCase() : 'U';
  const recentlyRecommended = MOCK_MOVIES.slice(0, 4);

  return (
    <div className="py-12 sm:py-16 text-left pb-24 space-y-10">
      <Container size="lg">
        {/* Header Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-[#0e111a] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-rose-500/25 shrink-0">
                {userInitial}
              </div>

              <div className="space-y-1.5">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="bg-[#0a0b10] text-white text-xl font-bold rounded-xl border border-slate-700 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveName}
                      isLoading={isSavingName}
                      leftIcon={Check}
                    >
                      Save
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(displayName);
                        setIsEditingName(false);
                      }}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                      {displayName}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Display Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user?.email || 'user@example.com'}</span>
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <Badge variant={user?.role?.toLowerCase() === 'admin' ? 'amber' : 'emerald'} size="sm" dot>
                    {user?.role?.toLowerCase() === 'admin' ? 'Administrator' : 'Standard Member'}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Member since October 2025</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/settings">
                <Button variant="secondary" size="sm">
                  Account Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-[#11141e]/90 border border-slate-800 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Watchlist</span>
              <Bookmark className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-white">{watchlist.length}</p>
            <span className="text-[11px] text-slate-500 block">Saved movies</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#11141e]/90 border border-slate-800 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Favorites</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-white">{favorites.length}</p>
            <span className="text-[11px] text-slate-500 block">All-time favorites</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#11141e]/90 border border-slate-800 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Reviews</span>
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{myReviews.length}</p>
            <span className="text-[11px] text-slate-500 block">Critiques posted</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#11141e]/90 border border-slate-800 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Mood Checks</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{moodHistory.length}</p>
            <span className="text-[11px] text-slate-500 block">Total emotional queries</span>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="border-b border-slate-800 flex items-center gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'history'
                ? 'text-rose-400 border-b-2 border-rose-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mood History ({moodHistory.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-rose-400 border-b-2 border-rose-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Reviews ({myReviews.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recommended')}
            className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'recommended'
                ? 'text-rose-400 border-b-2 border-rose-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recently Recommended
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton count={3} height="80px" className="rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Tab: Mood History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {moodHistory.length > 0 ? (
                  moodHistory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-[#11141e] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="amber" size="sm">
                            {item.detectedMood} Cinema
                          </Badge>
                          <span className="text-[11px] text-slate-500">
                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 italic">
                          "{item.inputText}"
                        </p>
                      </div>

                      <Link to={`/recommendations?mood=${item.moodId || 'happy'}`}>
                        <Button variant="ghost" size="sm">
                          View Matches →
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={History}
                    title="No mood checks recorded yet"
                    description="Run your first emotional assessment to log recommendations."
                    actionLabel="Check Mood Now"
                    onAction={() => window.location.assign('/mood')}
                  />
                )}
              </div>
            )}

            {/* Tab: My Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {myReviews.length > 0 ? (
                  myReviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-[#11141e] border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{r.movieTitle}</h4>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{r.rating}/10</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">"{r.comment}"</p>
                      <span className="text-[10px] text-slate-500 block">
                        Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title="No reviews written yet"
                    description="Visit any movie details page to leave your critique and impressions."
                    actionLabel="Browse Movies"
                    onAction={() => window.location.assign('/movies')}
                  />
                )}
              </div>
            )}

            {/* Tab: Recently Recommended */}
            {activeTab === 'recommended' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyRecommended.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
