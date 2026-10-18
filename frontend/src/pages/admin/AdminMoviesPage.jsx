import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Star,
  Clock,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [selectedMovieForDelete, setSelectedMovieForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    genres: '',
    releaseDate: '',
    rating: '7.5',
    runtime: '110',
    language: 'English',
    overview: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await adminService.getMovies({
        search,
        page,
        limit: 8
      });
      setMovies(data.movies);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load movie catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, page]);

  const resetForm = () => {
    setFormData({
      title: '',
      genres: '',
      releaseDate: '',
      rating: '7.5',
      runtime: '110',
      language: 'English',
      overview: ''
    });
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres || '',
      releaseDate: movie.releaseDate || '',
      rating: String(movie.rating || 7.5),
      runtime: String(movie.runtime || 110),
      language: movie.language || 'English',
      overview: movie.overview || ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.genres.trim()) errors.genres = 'At least one genre is required';
    if (!formData.releaseDate) errors.releaseDate = 'Release date is required';
    const numRating = parseFloat(formData.rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 10) {
      errors.rating = 'Rating must be between 1.0 and 10.0';
    }
    const numRuntime = parseInt(formData.runtime, 10);
    if (isNaN(numRuntime) || numRuntime <= 0) {
      errors.runtime = 'Runtime must be a positive number';
    }
    if (!formData.overview.trim()) errors.overview = 'Overview description is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        genres: formData.genres.split(',').map((g) => g.trim()).filter(Boolean),
        releaseDate: formData.releaseDate,
        rating: parseFloat(formData.rating),
        runtime: parseInt(formData.runtime, 10),
        language: formData.language,
        overview: formData.overview.trim(),
        source: 'Custom Admin'
      };

      await adminService.addMovie(payload);
      toast.success(`"${payload.title}" added to catalog`);
      setIsAddModalOpen(false);
      resetForm();
      fetchMovies();
    } catch {
      toast.error('Failed to add movie');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !editingMovie) return;

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        genres: formData.genres.split(',').map((g) => g.trim()).filter(Boolean),
        releaseDate: formData.releaseDate,
        rating: parseFloat(formData.rating),
        runtime: parseInt(formData.runtime, 10),
        language: formData.language,
        overview: formData.overview.trim()
      };

      await adminService.updateMovie(editingMovie.id, payload);
      toast.success(`"${payload.title}" updated`);
      setEditingMovie(null);
      resetForm();
      fetchMovies();
    } catch {
      toast.error('Failed to update movie');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMovie = async () => {
    if (!selectedMovieForDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteMovie(selectedMovieForDelete.id);
      toast.success(`"${selectedMovieForDelete.title}" removed from catalog`);
      setSelectedMovieForDelete(null);
      fetchMovies();
    } catch {
      toast.error('Failed to delete movie');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl shadow-black/40">
        <div>
          <Badge variant="amber" size="sm" className="mb-2">
            Catalog Governance
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            Movie Catalog Management
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Maintain curated titles, update metadata attributes, or inject custom movies into recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={Plus}
          >
            Add New Movie
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by title or genre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Total Entries: <strong className="text-amber-400 font-bold">{total}</strong>
          </span>
        </div>
      </div>

      {/* Movies Table Card */}
      <div className="rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-800/50">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-12 h-16 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-44 rounded" />
                    <Skeleton className="h-3 w-64 rounded" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Film}
              title="No Movies Found"
              description="No movie catalog entries matched your search criteria."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                >
                  Clear Search
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Movie</th>
                  <th className="py-4 px-4">Release</th>
                  <th className="py-4 px-4">Genres</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                {movies.map((m) => {
                  const releaseYear = m.releaseDate ? m.releaseDate.split('-')[0] : 'N/A';
                  const source = m.source || 'TMDb Seed';

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-800/25 transition-colors group"
                    >
                      {/* Movie poster & title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-14 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-500 overflow-hidden shadow-md">
                            {m.posterUrl ? (
                              <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                            ) : (
                              <Film className="w-5 h-5 text-amber-500/70" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white block group-hover:text-amber-400 transition-colors">
                              {m.title}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {m.runtime ? `${m.runtime} min` : '115 min'} • {m.language || 'English'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Release year */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {releaseYear}
                        </span>
                      </td>

                      {/* Genres */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(Array.isArray(m.genres) ? m.genres : [m.genres]).map((g, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/50"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{m.rating ? m.rating.toFixed(1) : '7.5'}</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge
                          variant={source === 'Custom Admin' ? 'purple' : 'slate'}
                          size="sm"
                        >
                          {source}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/movie/${m.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={ExternalLink}
                              title="View Public Details"
                            >
                              View
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(m)}
                            leftIcon={Edit}
                            title="Edit metadata"
                          >
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setSelectedMovieForDelete(m)}
                            leftIcon={Trash2}
                            title="Remove movie"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && movies.length > 0 && (
          <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({total} total movies)
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

      {/* Add Movie Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#0e111a] border border-slate-800 p-6 sm:p-8 shadow-2xl z-10 text-left space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Add Movie to Catalog</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Input movie metadata for catalog inclusion.</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitAdd} className="space-y-4">
                <Input
                  label="Movie Title"
                  placeholder="e.g. Interstellar Horizon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={formErrors.title}
                  required
                />

                <Input
                  label="Genres (comma-separated)"
                  placeholder="e.g. Sci-Fi, Adventure, Drama"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  error={formErrors.genres}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Release Date"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    error={formErrors.releaseDate}
                    required
                  />

                  <Input
                    label="Rating (1.0 - 10.0)"
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    error={formErrors.rating}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Runtime (minutes)"
                    type="number"
                    min="1"
                    value={formData.runtime}
                    onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                    error={formErrors.runtime}
                    required
                  />

                  <Input
                    label="Primary Language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Overview Synopsis
                  </label>
                  <textarea
                    rows={3}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Brief storyline or premise of the film..."
                    className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                  {formErrors.overview && (
                    <p className="text-[11px] text-rose-500">{formErrors.overview}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                  >
                    Save Movie
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Movie Modal */}
      <AnimatePresence>
        {editingMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMovie(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#0e111a] border border-slate-800 p-6 sm:p-8 shadow-2xl z-10 text-left space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Edit Movie Details</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Modify catalog information for {editingMovie.title}.</p>
                </div>
                <button
                  onClick={() => setEditingMovie(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <Input
                  label="Movie Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={formErrors.title}
                  required
                />

                <Input
                  label="Genres (comma-separated)"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  error={formErrors.genres}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Release Date"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    error={formErrors.releaseDate}
                    required
                  />

                  <Input
                    label="Rating (1.0 - 10.0)"
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    error={formErrors.rating}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Runtime (minutes)"
                    type="number"
                    min="1"
                    value={formData.runtime}
                    onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                    error={formErrors.runtime}
                    required
                  />

                  <Input
                    label="Primary Language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Overview Synopsis
                  </label>
                  <textarea
                    rows={3}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                  {formErrors.overview && (
                    <p className="text-[11px] text-rose-500">{formErrors.overview}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingMovie(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                  >
                    Update Movie
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Movie Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!selectedMovieForDelete}
        onClose={() => setSelectedMovieForDelete(null)}
        onConfirm={handleDeleteMovie}
        title="Delete Movie from Catalog"
        message={`Are you sure you want to remove "${selectedMovieForDelete?.title}" from the recommendation database? Users will no longer receive this title in their mood recommendations.`}
        confirmText="Remove Title"
        cancelText="Keep Title"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
