import React from 'react';
import { MessageSquare, Star } from 'lucide-react';
import ReviewItem from './ReviewItem';
import Badge from '../common/Badge';

export default function ReviewList({
  reviews = [],
  currentUserId,
  onEditReview,
  onDeleteReview
}) {
  const count = reviews.length;
  const avgRating =
    count > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)
      : null;

  return (
    <div className="space-y-6 text-left">
      {/* Header with Average Rating & Count */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-400" />
            <span>Community Reviews</span>
          </h3>
          <Badge variant="rose" size="sm">
            {count} {count === 1 ? 'Review' : 'Reviews'}
          </Badge>
        </div>

        {avgRating && (
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Community Avg: {avgRating} / 10</span>
          </div>
        )}
      </div>

      {/* Review Items */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              canModify={currentUserId === review.userId}
              onEdit={onEditReview}
              onDelete={onDeleteReview}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#11141e]/50 border border-dashed border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            No reviews yet for this movie. Be the first to share your thoughts above!
          </p>
        </div>
      )}
    </div>
  );
}
