import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function NotFoundPage() {
  return (
    <div className="py-24 sm:py-32 text-center">
      <Container size="sm">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-2xl relative overflow-hidden">
          <Badge variant="rose" size="md" className="mb-4">
            404 Lost in Space
          </Badge>
          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
            <Film className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3 font-display">
            Scene Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto mb-8">
            The reel you were searching for does not exist in our catalog or might have moved to another timeline.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="md" leftIcon={Home}>
                Return to Cinema
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
