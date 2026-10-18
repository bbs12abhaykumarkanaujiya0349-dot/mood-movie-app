import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Moodie ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0b10] text-slate-100 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-[#11141e] border border-red-500/30 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-white">Something went wrong</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected interface issue occurred. Our resilient architecture has isolated the problem to prevent application failure.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={this.handleReload} leftIcon={RotateCcw}>
                Reload Application
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleHome} leftIcon={Home}>
                Back to Safety
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
