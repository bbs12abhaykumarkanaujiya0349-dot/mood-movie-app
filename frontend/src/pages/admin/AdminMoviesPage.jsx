import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Film, Plus } from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { MOCK_MOVIES } from '../../data/movies';

export default function AdminMoviesPage() {
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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <Badge variant="amber" size="md" className="mb-3">
              Movie Catalog
            </Badge>
            <h1 className="text-3xl font-extrabold text-white">Manage Movies</h1>
            <p className="text-sm text-slate-400 mt-1">Catalog entries ({MOCK_MOVIES.length} active titles).</p>
          </div>
          <Button variant="primary" size="sm" leftIcon={Plus}>
            Add Custom Movie
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#11141e]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Genres</th>
                <th className="px-6 py-3.5">Release</th>
                <th className="px-6 py-3.5">Rating</th>
                <th className="px-6 py-3.5">Popularity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MOCK_MOVIES.slice(0, 10).map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-semibold text-white">{m.title}</td>
                  <td className="px-6 py-4 text-slate-400">{m.genres.join(', ')}</td>
                  <td className="px-6 py-4 text-slate-400">{m.releaseDate}</td>
                  <td className="px-6 py-4 text-amber-400 font-bold">★ {m.rating}</td>
                  <td className="px-6 py-4 text-slate-400">{m.popularity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
