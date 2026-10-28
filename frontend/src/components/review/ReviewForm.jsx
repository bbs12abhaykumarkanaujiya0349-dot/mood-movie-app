import React, { useState, useEffect } from 'react';
import { Star, Send, Check, X } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function ReviewForm({
  onSubmit,
  isSubmitting = false,
  initialRating = 5,
  initialComment = '',
  isEditMode = false,
  onCancel
}) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    setRating(initialRating || 5);
    setComment(initialComment || '');
  }, [initialRating, initialComment, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a short critique or review comment');
      return;
    }
    onSubmit({ rating, comment: comment.trim() });
    if (!isEditMode) {
      setComment('');
      setRating(5);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 text-left space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white mb-1">
            {isEditMode ? 'Edit Your Review' : 'Write a Review'}
          </h4>
          <p className="text-xs text-slate-400">
            {isEditMode
              ? 'Update your rating or critique for this film.'
              : 'Rate this film and share how it influenced your emotional state.'}
          </p>
        </div>

        {isEditMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Interactive Star Picker (1 to 5) */}
      <div>
        <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Your Rating: <span className="text-amber-400 font-bold">{hoverRating || rating} / 5</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = (hoverRating || rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${star} out of 5`}
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
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What resonated with you? (e.g., 'Unbelievable cinematography and deeply moving conclusion...')"
          className="w-full bg-[#0a0b10] text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-800 hover:border-slate-700 p-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        />
        <div className="flex justify-end text-[10px] text-slate-500 mt-1">
          {comment.length} / 1000
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {isEditMode && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          rightIcon={isEditMode ? Check : Send}
        >
          {isEditMode ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
