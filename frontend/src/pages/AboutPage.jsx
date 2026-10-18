import React from 'react';
import { Sparkles, Code2, Database, Shield, Cpu, BookOpen } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 text-left">
      <Container size="lg">
        <Badge variant="rose" size="md" className="mb-3">
          MCA Final Year Capstone
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mb-4">
          About Moodie
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed mb-12">
          An AI Mood-Based Movie Recommendation System designed to bridge human emotion and algorithmic cinema discovery. Developed adhering to formal Software Requirements Specification (SRS) standards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl bg-[#11141e]/80 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Hybrid Recommendation Logic</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Maps 8 emotional categories (Happy, Sad, Romantic, Angry, Excited, Relaxed, Fearful, Motivated) directly to weighted genres, incorporating IMDb rating thresholds and popularity indices.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#11141e]/80 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Resilient Zero-Failure Fallbacks</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Features an integrated 24+ movie offline dataset and deterministic rule-based sentiment classifier so the system remains fully functional even when external AI or movie APIs hit rate limits.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#0f121d] border border-slate-800/80">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            <span>Architecture & Technology Stack</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 uppercase font-semibold">Frontend</span>
              <p className="text-slate-200">React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 uppercase font-semibold">Backend API</span>
              <p className="text-slate-200">Node.js + Express.js + JWT + bcryptjs + Helmet</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 uppercase font-semibold">Persistence</span>
              <p className="text-slate-200">MongoDB + Mongoose ODM (Users, Movies, Reviews, History)</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
