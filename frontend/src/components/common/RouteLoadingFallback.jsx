import React from 'react';
import Spinner from './Spinner';

export default function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 transition-opacity duration-300"
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute w-20 h-20 bg-rose-500/20 rounded-full blur-xl animate-pulse" />
        <Spinner size="lg" color="border-rose-500" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400 animate-pulse">
        Loading experience...
      </p>
    </div>
  );
}
