import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Brain,
  Sliders,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Zap,
  Lightbulb
} from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import MoodCard from '../components/mood/MoodCard';
import { MOODS } from '../constants/moods';
import moodService from '../services/moodService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const EXAMPLE_PROMPTS = [
  'Exhausted after exam week, need pure heartwarming laughs',
  'Want to dive into a deep, touching drama and cry it out',
  'Need intense adrenaline and high-octane sci-fi space action',
  'Cozy rainy Sunday evening with warm family animation',
  'Looking for unstoppable motivation to conquer my goals'
];

export default function MoodSelectPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'text'

  // Mode 1: Predefined mood selection
  const [selectedMoodId, setSelectedMoodId] = useState('happy');

  // Mode 2: Natural language input
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Handle Tab 1 submit
  const handleCardSubmit = () => {
    if (!selectedMoodId) {
      toast.error('Please pick a mood category first');
      return;
    }
    const chosenMood = MOODS.find((m) => m.id === selectedMoodId);
    toast.success(`Selected ${chosenMood.label} cinema!`);
    navigate(`/recommendations?mood=${selectedMoodId}`);
  };

  // Handle Tab 2 submit
  const handleAnalyzeText = async (e) => {
    e?.preventDefault();
    if (!promptText.trim()) {
      toast.error('Please describe how you are feeling in the text box');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await moodService.analyzeMoodText(promptText);
      setAnalysisResult(result);

      // Record in history mock
      await userService.addHistory({
        inputText: promptText,
        detectedMood: result.label,
        confidence: result.confidence,
        count: 12
      });

      toast.success(`Detected Mood: ${result.label} (${Math.round(result.confidence * 100)}% match)`);
    } catch (err) {
      toast.error(err.message || 'Mood analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUsePrompt = (text) => {
    setPromptText(text);
    setAnalysisResult(null);
  };

  return (
    <div className="py-12 sm:py-16 text-left pb-24">
      <Container size="lg">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="amber" size="md" className="mb-3">
            FR-03 & FR-04: Emotional Alignment
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mb-3">
            How Are You Feeling?
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Choose a quick emotional card or express your state of mind in plain words. Moodie matches your feeling to relevant movie genres.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[#121520] border border-slate-800 mt-8 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('cards');
                setAnalysisResult(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'cards'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Pick a Mood Tag</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'text'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Describe How You Feel (AI / NLP)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: 8 Mood Cards Grid */}
        {activeTab === 'cards' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {MOODS.map((mood) => (
                <MoodCard
                  key={mood.id}
                  mood={mood}
                  isSelected={selectedMoodId === mood.id}
                  onSelect={(m) => setSelectedMoodId(m.id)}
                />
              ))}
            </div>

            {/* Bottom Action Bar */}
            <div className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400">Current Selection:</span>
                <p className="text-base font-bold text-white capitalize">
                  {selectedMoodId} Cinema —{' '}
                  <span className="text-rose-400 font-normal">
                    {MOODS.find((m) => m.id === selectedMoodId)?.mappedGenres.join(', ')}
                  </span>
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleCardSubmit}
                rightIcon={ArrowRight}
              >
                Find My Movies
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Natural Language Mood Analysis */}
        {activeTab === 'text' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <form onSubmit={handleAnalyzeText} className="space-y-4">
              <div className="p-6 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-rose-400" />
                    <span>Free-form Emotional State</span>
                  </label>
                  <span className="text-xs text-slate-500">{promptText.length} / 300</span>
                </div>

                <textarea
                  rows={4}
                  maxLength={300}
                  value={promptText}
                  onChange={(e) => {
                    setPromptText(e.target.value);
                    if (analysisResult) setAnalysisResult(null);
                  }}
                  placeholder="Tell us what's happening or how your day felt... e.g., 'Had a long stressful day at the office and just need something warm, funny, and comforting.'"
                  className="w-full bg-[#0a0b10] text-slate-100 text-sm rounded-2xl border border-slate-800 hover:border-slate-700 p-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 leading-relaxed"
                />

                {/* Example chips */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Need inspiration? Try an example prompt:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUsePrompt(sample)}
                        className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors text-left"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isAnalyzing}
                    rightIcon={Sparkles}
                  >
                    Analyze My Mood
                  </Button>
                </div>
              </div>
            </form>

            {/* Analyzing Animation State */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-[#11141e]/70 border border-rose-500/30 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Deconstructing Emotional Sentiment...
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Evaluating keyword affective weights and aligning text semantics with SRS Section 6 mood categories.
                </p>
              </motion.div>
            )}

            {/* Analysis Result Card */}
            {analysisResult && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-[#191124] to-[#0d101a] border border-rose-500/30 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-2xl font-bold shadow-lg shadow-rose-500/20">
                      ✨
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Detected Mood Category</span>
                      <h3 className="text-2xl font-extrabold text-white">
                        {analysisResult.label} Cinema
                      </h3>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Confidence Score</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {Math.round(analysisResult.confidence * 100)}% Match
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-1.5">
                  <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Matched Genres: {analysisResult.mappedGenres.join(', ')}</span>
                  </p>
                  <p className="text-slate-400">{analysisResult.rationale}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() =>
                      navigate(
                        `/recommendations?mood=${analysisResult.moodId}&confidence=${analysisResult.confidence}&query=${encodeURIComponent(
                          promptText
                        )}`
                      )
                    }
                    rightIcon={ArrowRight}
                  >
                    View Matched Recommendations
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
