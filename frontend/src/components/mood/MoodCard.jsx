import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  CloudRain,
  Heart,
  Flame,
  Zap,
  Coffee,
  Ghost,
  Trophy,
  ArrowRight
} from 'lucide-react';

const ICON_MAP = {
  Sun,
  CloudRain,
  Heart,
  Flame,
  Zap,
  Coffee,
  Ghost,
  Trophy
};

export default function MoodCard({ mood, isSelected = false, onSelect }) {
  const { id, label, tagline, iconName, mappedGenres = [], borderHover, bgGradient } = mood;
  const IconComponent = ICON_MAP[iconName] || Sun;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect && onSelect(mood)}
      className={`group text-left relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 w-full cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-rose-500 bg-[#161a26] shadow-xl shadow-rose-500/20 ring-2 ring-rose-500/50'
          : `border-slate-800/80 bg-[#11141e]/90 hover:bg-[#151926] ${borderHover} shadow-md shadow-black/40`
      }`}
    >
      {/* Background radial glow on hover */}
      <div
        className={`absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none bg-gradient-to-br ${bgGradient}`}
      />

      {/* Top row: Icon + Indicator */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg ${
            isSelected
              ? 'bg-rose-500 text-white'
              : 'bg-slate-800/80 text-slate-200 group-hover:text-white group-hover:bg-slate-700/80'
          }`}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 group-hover:text-slate-200 transition-colors">
          {mappedGenres[0]}
        </span>
      </div>

      {/* Middle: Mood Title & Tagline */}
      <div className="relative z-10 mb-4">
        <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-2">
          {label}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {tagline}
        </p>
      </div>

      {/* Bottom: Genre chips + explore indicator */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {mappedGenres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-slate-300 font-medium"
            >
              #{genre}
            </span>
          ))}
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.button>
  );
}
