import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Deletion modal state
  const [selectedReviewForDelete, setSelectedReviewForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews({
        search,
        sentiment: sentimentFilter,
        status: statusFilter,
        page,
        limit: 8
      });
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [search, sentimentFilter, statusFilter, page]);

  const handleToggleVisibility = async (r) => {
    try {
      await adminService.toggleReviewVisibility(r.id);
      const newStatus = r.status === 'visible' ? 'hidden' : 'visible';
      toast.success(`Review is now ${newStatus}`);
      fetchReviews();
    } catch {
      toast.error('Failed to change review visibility');
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReviewForDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteReview(selectedReviewForDelete.id);
      toast.success('Review deleted successfully');
      setSelectedReviewForDelete(null);
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSentimentVariant = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'emerald';
      case 'negative':
        return 'rose';
      case 'neutral':
      default:
        return 'amber';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl shadow-black/40">
        <div>
          <Badge variant="rose" size="sm" className="mb-2">
            Governance & Community
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            Review Moderation
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Audit user sentiments, moderate feedback, and manage community contributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 font-medium">
            Total Reviews: <strong className="text-rose-400 font-bold">{total}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by user, movie, or keywords..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={Search}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Sentiment:
            </span>
            <select
              value={sentimentFilter}
              onChange={(e) => {
                setSentimentFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5 text-amber-400" /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table Card */}
      <div className="rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-800/50">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-80 rounded" />
                </div>
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={MessageSquare}
              title="No Reviews Found"
              description="No community reviews matched your current search and filter combination."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setSentimentFilter('All');
                    setStatusFilter('All');
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">User & Movie</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-4">Sentiment</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                {reviews.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/25 transition-colors group"
                  >
                    {/* User & Movie */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white block">
                          {r.userName}
                        </span>
                        <span className="text-[11px] text-amber-400/90 font-medium block">
                          {r.movieTitle}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(r.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{r.rating}/10</span>
                      </div>
                    </td>

                    {/* Sentiment Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge variant={getSentimentVariant(r.sentiment)} size="sm" className="capitalize">
                        {r.sentiment}
                      </Badge>
                    </td>

                    {/* Comment */}
                    <td className="py-4 px-6 max-w-xs md:max-w-md">
                      <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                        "{r.comment}"
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {r.status === 'visible' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Eye className="w-3 h-3" />
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant={r.status === 'visible' ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleVisibility(r)}
                          leftIcon={r.status === 'visible' ? EyeOff : Eye}
                          title={r.status === 'visible' ? 'Hide review' : 'Make review visible'}
                        >
                          {r.status === 'visible' ? 'Hide' : 'Unhide'}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setSelectedReviewForDelete(r)}
                          leftIcon={Trash2}
                          title="Permanently remove review"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && reviews.length > 0 && (
          <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({total} total reviews)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                leftIcon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                rightIcon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Review Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!selectedReviewForDelete}
        onClose={() => setSelectedReviewForDelete(null)}
        onConfirm={handleDeleteReview}
        title="Delete Community Review"
        message={`Are you sure you want to permanently remove this review for "${selectedReviewForDelete?.movieTitle}" submitted by ${selectedReviewForDelete?.userName}? This action cannot be undone.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
