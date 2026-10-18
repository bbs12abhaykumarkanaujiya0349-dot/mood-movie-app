import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function ReviewForm({ onSubmit, isSubmitting = false }) {
  const [rating, setRating] = useState(8);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a short critique or review comment');
      return;
    }
    onSubmit({ rating, comment: comment.trim() });
    setComment('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 text-left space-y-4"
    >
      <div>
        <h4 className="text-sm font-bold text-white mb-1">Write a Review</h4>
        <p className="text-xs text-slate-400">
          Rate this film and share how it influenced your emotional state.
        </p>
      </div>

      {/* Interactive Star Picker (1 to 10) */}
      <div>
        <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Your Rating: <span className="text-amber-400 font-bold">{hoverRating || rating} / 10</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
            const active = (hoverRating || rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${star} out of 10`}
              >
                <Star
                  className={`w-5 h-5 ${
                    active ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Comment Textarea */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Comment / Impression
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What resonated with you? (e.g., 'Unbelievable cinematography and deeply moving conclusion...')"
          className="w-full bg-[#0a0b10] text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 hover:border-slate-700 p-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          rightIcon={Send}
        >
          Submit Review
        </Button>
      </div>
    </form>
  );
}
