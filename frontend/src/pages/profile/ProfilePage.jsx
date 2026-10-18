import React from 'react';
import { User, Mail, Shield, Bookmark, Star, Clock } from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function ProfilePage() {
  return (
    <div className="py-12 sm:py-16 text-left">
      <Container size="md">
        <Badge variant="rose" size="md" className="mb-3">
          User Account
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mb-8">
          User Profile
        </h1>

        <div className="p-8 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-2xl mb-8 space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-rose-500/20">
              U
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Student Demo User</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>demo.student@mca.edu</span>
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant="emerald" size="sm" dot>
                User Role
              </Badge>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-xl font-bold text-white">4</span>
              <span className="text-xs text-slate-400">Watchlist</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-xl font-bold text-white">2</span>
              <span className="text-xs text-slate-400">Mood Queries</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-xl font-bold text-white">0</span>
              <span className="text-xs text-slate-400">Reviews</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Coming in Step F7:</p>
          <p>Full MongoDB profile persistence, favorite genre distribution analytics, and review management.</p>
        </div>
      </Container>
    </div>
  );
}
