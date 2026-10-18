import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Film, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Users', value: '1,248', icon: Users, color: 'text-blue-400', link: '/admin/users' },
    { label: 'Movies in Catalog', value: '24+', icon: Film, color: 'text-amber-400', link: '/admin/movies' },
    { label: 'Reviews Submitted', value: '430', icon: MessageSquare, color: 'text-rose-400', link: '/admin/reviews' },
    { label: 'Mood Queries Today', value: '89', icon: TrendingUp, color: 'text-purple-400', link: '/admin/analytics' }
  ];

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge variant="rose" size="md" className="mb-3">
              FR-12: Administration
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Admin Governance Center
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              System monitoring, user accounts, review moderation, and recommendation analytics.
            </p>
          </div>
          <Badge variant="purple" size="md" dot>
            Administrator Role Verified
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-[#11141e]/90 border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <Link
                to={stat.link}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1 pt-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>

        {/* Admin Navigation Hub */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 hover:border-slate-700 transition-colors block group"
          >
            <Users className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              User Management
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspect user roles, account creations, and activity logs.
            </p>
          </Link>

          <Link
            to="/admin/reviews"
            className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 hover:border-slate-700 transition-colors block group"
          >
            <MessageSquare className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              Review Moderation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Flag and moderate user reviews and sentiment ratings.
            </p>
          </Link>

          <Link
            to="/admin/analytics"
            className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 hover:border-slate-700 transition-colors block group"
          >
            <TrendingUp className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              Usage Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Distribution charts of popular moods and conversion metrics.
            </p>
          </Link>
        </div>
      </Container>
    </div>
  );
}
