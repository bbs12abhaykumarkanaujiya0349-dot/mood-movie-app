import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function ForbiddenPage() {
  return (
    <div className="py-24 sm:py-32 text-center">
      <Container size="sm">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#11141e]/90 border border-red-500/30 shadow-2xl relative overflow-hidden">
          <Badge variant="danger" size="md" className="mb-4">
            403 Forbidden Access
          </Badge>

          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3 font-display">
            Restricted Territory
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Administrative privileges are required to view this portal. Your current account does not hold the <code className="text-rose-400 bg-slate-900 px-2 py-0.5 rounded">admin</code> role.
          </p>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 mb-8 max-w-md mx-auto">
            <p className="font-semibold text-slate-300 mb-1">Testing Tip:</p>
            <p>Log in with any email containing <span className="text-amber-400 font-mono">admin</span> (e.g. <span className="text-amber-300 font-mono">admin@moodie.app</span>) to activate administrator role.</p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link to="/home">
              <Button variant="primary" size="md" leftIcon={Home}>
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
