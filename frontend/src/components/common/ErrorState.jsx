import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this content. Please try again.',
  onRetry,
  className = ''
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-red-500/20 bg-red-950/10 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/10">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          leftIcon={RotateCcw}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
