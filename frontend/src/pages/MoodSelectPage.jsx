import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Film } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import MoodCard from '../components/mood/MoodCard';
import MovieCard from '../components/movie/MovieCard';
import { MOODS } from '../constants/moods';
import { MOCK_MOVIES } from '../data/movies';
import toast from 'react-hot-toast';

export default function MoodSelectPage() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState('happy');
  const [textInput, setTextInput] = useState('');
  const [watchlist, setWatchlist] = useState([]);

  const currentMood = MOODS.find((m) => m.id === selectedMood) || MOODS[0];

  const matchedMovies = MOCK_MOVIES.filter((movie) =>
    movie.genres.some((genre) => currentMood.mappedGenres.includes(genre))
  );

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) {
      toast.error('Please enter a description of how you are feeling');
      return;
    }
    toast.success('Analyzing emotional sentiment...');
    navigate(`/recommendations?query=${encodeURIComponent(textInput)}`);
  };

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
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <Badge variant="amber" size="md" className="mb-3">
            FR-03 & FR-04: Mood Assessment
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Select or Describe Your Mood
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Choose an emotional tone below or type your current feelings for intelligent genre alignment.
          </p>

          {/* Natural Language Mood Input */}
          <form
            onSubmit={handleTextSubmit}
            className="mt-6 flex items-center gap-2 p-1.5 rounded-2xl bg-[#121520] border border-slate-700/80 shadow-xl"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g., 'Exhausted after exams, need pure escapism'"
              className="w-full bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="sm" rightIcon={Send}>
              Analyze
            </Button>
          </form>
        </div>

        {/* 8 Mood Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {MOODS.map((mood) => (
            <MoodCard
              key={mood.id}
              mood={mood}
              isSelected={selectedMood === mood.id}
              onSelect={(m) => setSelectedMood(m.id)}
            />
          ))}
        </div>

        {/* Matched Movies Section */}
        <div className="pt-8 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="rose" size="md" dot>
                  {currentMood.label} Matches
                </Badge>
                <span className="text-xs text-slate-400">
                  Mapped to: {currentMood.mappedGenres.join(', ')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Movies suited for when you feel {currentMood.label.toLowerCase()}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {matchedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchlistToggle={handleWatchlistToggle}
                isSaved={watchlist.includes(movie.id)}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
