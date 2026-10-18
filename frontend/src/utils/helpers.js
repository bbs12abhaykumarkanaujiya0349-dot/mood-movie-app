/**
 * Generates an aesthetic, deterministic gradient for a movie based on its title and genres.
 * Ensures consistent, gorgeous visuals even when external posters are unavailable.
 */
export function getMovieGradient(title = '', genre = '') {
  const gradients = [
    'from-rose-950 via-purple-950 to-slate-950',
    'from-indigo-950 via-slate-900 to-amber-950',
    'from-emerald-950 via-teal-950 to-slate-950',
    'from-blue-950 via-indigo-950 to-slate-950',
    'from-purple-950 via-rose-950 to-slate-950',
    'from-amber-950 via-orange-950 to-slate-950',
    'from-cyan-950 via-blue-950 to-slate-950',
    'from-red-950 via-slate-900 to-purple-950'
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

/**
 * Formats runtime minutes into readable format (e.g. 142 -> 2h 22m).
 */
export function formatRuntime(minutes) {
  if (!minutes) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

/**
 * Returns release year string from YYYY-MM-DD or full year.
 */
export function getReleaseYear(dateString) {
  if (!dateString) return 'TBA';
  return dateString.split('-')[0] || dateString;
}

/**
 * Maps rating to qualitative color.
 */
export function getRatingColor(rating) {
  if (rating >= 8.0) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  if (rating >= 7.0) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  return 'text-slate-300 border-slate-600/40 bg-slate-800/20';
}
