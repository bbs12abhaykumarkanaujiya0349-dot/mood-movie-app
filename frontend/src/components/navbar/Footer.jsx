import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Sparkles, Heart, Film, Shield, Terminal } from 'lucide-react';
import Container from '../common/Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#07080d] border-t border-slate-900 mt-auto pt-16 pb-12 text-slate-400 text-sm">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Clapperboard className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white font-display">Moodie</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, mood-aware movie recommendation platform powered by natural language understanding and real-time emotional matching.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>MCA Final Year Capstone Project</span>
            </div>
          </div>

          {/* Quick Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Movie Discovery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/movies" className="hover:text-rose-400 transition-colors">
                  All Movies Catalog
                </Link>
              </li>
              <li>
                <Link to="/mood" className="hover:text-rose-400 transition-colors">
                  Mood Selector
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-rose-400 transition-colors">
                  AI Recommendations
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-rose-400 transition-colors">
                  Personal Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Architecture & Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>React + Vite + Tailwind CSS</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Node.js + Express REST API</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>MongoDB + Mongoose Models</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Hybrid NLP Fallback Engine</span>
              </li>
            </ul>
          </div>

          {/* System & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              System Status
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built with zero-failure fallbacks: local movie dataset active if TMDb is offline, heuristic classifier active if NLP API is unavailable.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>JWT & Role Protection Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} Moodie. Original cinematic UI design. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-200 transition-colors">
              About Project
            </Link>
            <Link to="/admin" className="hover:text-slate-200 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
