import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    danger: 'bg-red-500/10 text-red-300 border-red-500/30'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium'
  };

  const dotColors = {
    default: 'bg-slate-400',
    rose: 'bg-rose-400',
    amber: 'bg-amber-400',
    purple: 'bg-purple-400',
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    danger: 'bg-red-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[variant] || dotColors.default}`}
        />
      )}
      {children}
    </span>
  );
}
