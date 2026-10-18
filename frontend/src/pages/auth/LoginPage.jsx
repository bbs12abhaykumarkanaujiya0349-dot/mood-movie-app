import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function LoginPage() {
  return (
    <div className="py-16 sm:py-24 text-center">
      <Container size="sm">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-2xl relative overflow-hidden text-left">
          <Badge variant="rose" size="md" className="mb-4">
            Step F1 Placeholder
          </Badge>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Sign In</h1>
          </div>
          <p className="text-slate-400 text-sm mb-8">
            Authentication flow, forms, and JWT state management are scheduled for the upcoming Step F3 (Login, Registration & Protected Routes).
          </p>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1 mb-8">
            <p className="font-semibold text-slate-300">Target Requirements:</p>
            <p>• FR-02: Secure User Authentication (JWT)</p>
            <p>• Password hashing with bcrypt (Backend)</p>
            <p>• Form validation with React Hook Form</p>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
                Back to Home
              </Button>
            </Link>
            <Link to="/register">
              <span className="text-xs text-rose-400 hover:underline">
                Need an account? Register
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
