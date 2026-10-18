import React, { useState } from 'react';
import { Star, Edit3, Trash2, Check, X, User } from 'lucide-react';
import Button from '../common/Button';

export default function ReviewItem({ review, onEdit, onDelete, canModify = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [editedComment, setEditedComment] = useState(review.comment);

  const handleSave = () => {
    if (!editedComment.trim()) return;
    onEdit(review.id, { rating: editedRating, comment: editedComment.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRating(review.rating);
    setEditedComment(review.comment);
    setIsEditing(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#12151f] border border-slate-800 text-left space-y-3">
      {/* Review Header: User info, Rating, Date */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 text-xs font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{review.userName}</span>
            <span className="text-[10px] text-slate-400">{review.date}</span>
          </div>
        </div>

        {/* Stars Display */}
        <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{isEditing ? editedRating : review.rating} / 10</span>
        </div>
      </div>

      {/* Review Body */}
      {isEditing ? (
        <div className="space-y-3 pt-2">
          {/* Rating Slider / Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Score:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditedRating(star)}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    editedRating >= star ? 'text-amber-400 font-bold' : 'text-slate-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            rows={3}
            className="w-full bg-[#0a0b10] text-slate-100 text-xs rounded-xl border border-slate-700 p-3 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleSave} leftIcon={Check}>
              Save Changes
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} leftIcon={X}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Action Controls for owner */}
      {canModify && !isEditing && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(review.id)}
            className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
