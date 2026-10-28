import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Film,
  Brain,
  SlidersHorizontal,
  BookmarkCheck,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  Zap
} from 'lucide-react';
import Container from '../../components/common/Container';
import { useLibrary } from '../../context/LibraryContext';
import useAuth from '../../hooks/useAuth';
import { movieService } from '../../services/movieService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MovieCard from '../../components/movie/MovieCard';
import MoodCard from '../../components/mood/MoodCard';
import { MOODS } from '../../constants/moods';
import { MOCK_MOVIES } from '../../data/movies';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleWatchlist, isInWatchlist } = useLibrary();
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodInput, setMoodInput] = useState('');
  const [realMovies, setRealMovies] = useState([]);
  const [localWatchlist, setLocalWatchlist] = useState(['m1', 'm6']);
  const trendingScrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTrending() {
      try {
        const data = await movieService.getTrending();
        if (isMounted && data && Array.isArray(data.results) && data.results.length > 0) {
          setRealMovies(data.results);
        }
      } catch (err) {
        // Fall back to local mock movies
      }
    }
    fetchTrending();
    return () => { isMounted = false; };
  }, []);

  const handleWatchlistToggle = (movie) => {
    if (user) {
      toggleWatchlist(movie);
      return;
    }
    const id = movie.id || movie._id;
    if (localWatchlist.includes(id)) {
      setLocalWatchlist(localWatchlist.filter((mId) => mId !== id));
      toast.success(`Removed "${movie.title}" from watchlist`);
    } else {
      setLocalWatchlist([...localWatchlist, id]);
      toast.success(`Added "${movie.title}" to watchlist`);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id === selectedMood ? null : mood.id);
    toast(`Filtered preview for ${mood.label} mood!`, {
      icon: '✨',
      style: {
        borderRadius: '12px',
        background: '#12151f',
        color: '#f8fafc',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!moodInput.trim()) {
      toast.error('Please enter a short description of how you feel');
      return;
    }
    toast.success(`Analyzing mood: "${moodInput}"`);
    navigate(`/recommendations?query=${encodeURIComponent(moodInput)}`);
  };

  const scrollTrending = (direction) => {
    if (trendingScrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      trendingScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter movies if a mood is selected
  const activeMoodObj = MOODS.find((m) => m.id === selectedMood);
  const baseMovies = realMovies.length > 0 ? realMovies : MOCK_MOVIES;
  const displayedMovies = activeMoodObj
    ? baseMovies.filter((m) =>
        (m.genres || []).some((g) => activeMoodObj.mappedGenres.includes(g))
      )
    : baseMovies;

  return (
    <div className="w-full relative overflow-hidden space-y-24 sm:space-y-32 pb-24">
      {/* =========================================================================
          HERO SECTION
         ========================================================================= */}
      <section className="relative pt-8 sm:pt-16 pb-12 sm:pb-20 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-b from-rose-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-[-10%] w-[350px] h-[350px] bg-amber-500/10 blur-[120px] pointer-events-none -z-10" />

        <Container>
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-rose-500/30 text-rose-300 text-xs font-semibold shadow-lg shadow-rose-500/10 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Next-Gen Emotional Movie Recommendation</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-slate-400 font-normal">MCA Capstone</span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-display"
            >
              Don't browse endlessly.{' '}
              <span className="block mt-2 bg-gradient-to-r from-rose-400 via-amber-300 to-rose-500 bg-clip-text text-transparent">
                Feel the movie first.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed"
            >
              Whether you need cathartic tears, an adrenaline surge, or cozy laughter, Moodie matches your real-time emotion with the perfect cinema experience.
            </motion.p>

            {/* Natural Language Prompt Input Bar */}
            <motion.form
              onSubmit={handleSearchSubmit}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-2xl relative p-1.5 sm:p-2 rounded-2xl bg-[#121520]/80 border border-slate-700/80 shadow-2xl shadow-rose-950/20 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2 text-left"
            >
              <div className="flex items-center gap-3 w-full px-3 py-2 text-slate-300">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value)}
                  placeholder="Express your mood... (e.g. 'Feeling worn out and need hope')"
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto shrink-0"
                rightIcon={Send}
              >
                Match Mood
              </Button>
            </motion.form>

            {/* Quick CTAs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-4 flex-wrap pt-2"
            >
              <Link to="/mood">
                <Button variant="secondary" size="md" leftIcon={Zap}>
                  Select Predefined Mood
                </Button>
              </Link>
              <Link to="/movies">
                <Button variant="ghost" size="md" rightIcon={ArrowRight}>
                  Explore All 24+ Movies
                </Button>
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          HOW IT WORKS (3-STEP SECTION)
         ========================================================================= */}
      <section className="relative">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="rose" size="md" className="mb-3">
              Workflow
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Three steps to your ideal movie night
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              How our intelligent mood classification and recommendation engine works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl bg-[#11141e]/80 border border-slate-800 shadow-lg text-left relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 font-bold text-lg group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Express Your State</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Choose from 8 curated mood tags or type an open sentence describing what is on your mind.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl bg-[#11141e]/80 border border-slate-800 shadow-lg text-left relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 font-bold text-lg group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Mood Mapping</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The NLP layer evaluates sentiment and maps your state directly to genre clusters and emotional tones.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl bg-[#11141e]/80 border border-slate-800 shadow-lg text-left relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 font-bold text-lg group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Curated Matches</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive ranked recommendations with ratings, overviews, and one-click watchlist curation.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          MOOD SELECTOR PREVIEW (8 MOOD CARDS)
         ========================================================================= */}
      <section className="relative">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="amber" size="md">
                  Emotional Spectrum
                </Badge>
                {selectedMood && (
                  <button
                    type="button"
                    onClick={() => setSelectedMood(null)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                How do you want to feel right now?
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-1">
                Click any mood card below to preview matched cinema genres.
              </p>
            </div>
            <Link to="/mood">
              <Button variant="ghost" size="sm" rightIcon={ArrowRight}>
                Full Mood Assessment
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {MOODS.map((mood) => (
              <MoodCard
                key={mood.id}
                mood={mood}
                isSelected={selectedMood === mood.id}
                onSelect={handleMoodSelect}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          TRENDING / CURATED MOVIE CAROUSEL ROW
         ========================================================================= */}
      <section className="relative">
        <Container>
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="rose" size="md" dot>
                  {activeMoodObj ? `${activeMoodObj.label} Cinema` : 'Trending Now'}
                </Badge>
                <span className="text-xs text-slate-400">
                  Showing {displayedMovies.length} titles
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeMoodObj
                  ? `Recommended for your "${activeMoodObj.label}" state`
                  : 'Popular titles across all categories'}
              </h2>
            </div>

            {/* Scroll navigation controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTrending('left')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrending('right')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scrollable track with resilient MovieCards */}
          <div
            ref={trendingScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {displayedMovies.map((movie) => {
              const movieId = movie.id || movie._id;
              const isSaved = user
                ? isInWatchlist(movieId)
                : localWatchlist.includes(movieId);
              return (
                <div
                  key={movieId}
                  className="w-[240px] sm:w-[270px] shrink-0"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <MovieCard
                    movie={movie}
                    onWatchlistToggle={handleWatchlistToggle}
                    isSaved={isSaved}
                  />
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          KEY FEATURES SECTION (6 FEATURE CARDS)
         ========================================================================= */}
      <section className="relative">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="purple" size="md" className="mb-3">
              Capabilities
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for genuine emotional discovery
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              A comprehensive architecture built to MCA project standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#11141e]/70 border border-slate-800/80 hover:border-rose-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Natural Language Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter free-form thoughts like "I had a exhausting day and need pure laughs" for direct sentiment-to-genre classification.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#11141e]/70 border border-slate-800/80 hover:border-amber-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Hybrid Recommendation Logic</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Harmonizes mood relevance, IMDb ratings, popularity, and genre weightings per SRS Section 6 specifications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#11141e]/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Resilient Fallback System</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero external dependency breakage. Local movie catalog and heuristic NLP maintain 100% uptime even offline.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#11141e]/70 border border-slate-800/80 hover:border-purple-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Watchlists & Favorites</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Save movies into personal collections with instantaneous state synchronization and quick review access.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#11141e]/70 border border-slate-800/80 hover:border-blue-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">User Reviews & Ratings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit critiques with numerical scores and sentiment tags to fuel future recommendation personalization.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#11141e]/70 border border-slate-800/80 hover:border-rose-500/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Admin Governance & Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Administrative oversight for user activity, review moderation, and recommendation analytics.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          FINAL CALL TO ACTION BANNER
         ========================================================================= */}
      <section className="relative">
        <Container>
          <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-rose-500/30 bg-gradient-to-r from-[#170e1e] via-[#1a1122] to-[#141829] shadow-2xl text-center">
            {/* Ambient radiant orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <Badge variant="rose" size="md">
                Start Exploring Now
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
                Ready to find the movie matching your state of mind?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-light">
                No credit cards, no endless scrolling. Discover curated cinema tailored directly to you in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={ArrowRight}>
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/mood" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto" leftIcon={Zap}>
                    Try Mood Matcher
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
