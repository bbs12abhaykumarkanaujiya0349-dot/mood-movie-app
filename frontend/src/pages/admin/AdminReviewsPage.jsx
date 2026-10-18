import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Trash2, CheckCircle } from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([
    { id: 'r1', movie: 'The Midnight Odyssey', user: 'Cinema Enthusiast', rating: 9, comment: 'Phenomenal visuals and soundtrack!', date: '2026-03-12' },
    { id: 'r2', movie: 'Sunny Side Boulevard', user: 'Demo Student', rating: 8, comment: 'Brought genuine smiles on a gloomy day.', date: '2026-03-15' }
  ]);

  const handleDelete = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
    toast.success('Review removed successfully');
  };

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <Badge variant="rose" size="md" className="mb-3">
            FR-12: Review Moderation
          </Badge>
          <h1 className="text-3xl font-extrabold text-white">Review Moderation</h1>
          <p className="text-sm text-slate-400 mt-1">Review, approve, or remove community movie critiques.</p>
        </div>

        <div className="space-y-4 max-w-4xl">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{r.movie}</h3>
                  <Badge variant="amber" size="sm">★ {r.rating}/10</Badge>
                </div>
                <p className="text-xs text-slate-300">"{r.comment}"</p>
                <span className="text-[11px] text-slate-500">By {r.user} • {r.date}</span>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(r.id)}
                leftIcon={Trash2}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
