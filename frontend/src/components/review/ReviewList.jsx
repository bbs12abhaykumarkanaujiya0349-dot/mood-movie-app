import React from 'react';
import { MessageSquare, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewItem from './ReviewItem';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function ReviewList({
  reviews = [],
  currentUserId,
  summary,
  page = 1,
  totalPages = 1,
  onPageChange,
  onEditReview,
  onDeleteReview,
  loading = false
}) {
  const count = summary?.reviewCount !== undefined ? summary.reviewCount : reviews.length;
  const avgRating =
    summary?.averageRating !== undefined && summary.averageRating > 0
      ? Number(summary.averageRating).toFixed(1)
      : reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6 text-left">
      {/* Header with Average Rating & Count */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
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
            <span>Community Avg: {avgRating} / 5</span>
          </div>
        )}
      </div>

      {/* Review Items */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => {
            const rId = review.id || review._id;
            const rUserId = review.userId?._id || review.userId?.id || review.userId;
            const isOwner = Boolean(
              currentUserId &&
              (String(rUserId) === String(currentUserId) || review.isOwner)
            );

            return (
              <ReviewItem
                key={rId}
                review={review}
                canModify={isOwner}
                onEdit={onEditReview}
                onDelete={onDeleteReview}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#11141e]/50 border border-dashed border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            No reviews yet for this movie. Be the first to share your thoughts above!
          </p>
        </div>
      )}

      {/* Pagination if multiple pages */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              leftIcon={ChevronLeft}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              rightIcon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
