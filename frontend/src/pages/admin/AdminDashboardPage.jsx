import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Film,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import adminService from '../../services/adminService';

// Custom dark tooltip for recharts
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#0e111a] border border-slate-700/80 p-3 shadow-2xl text-xs text-left space-y-1">
        <p className="font-bold text-white">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color || '#f43f5e' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await adminService.getDashboardStats('7d');
      setData(stats);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 text-left">
        <Skeleton width="220px" height="32px" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Skeleton count={6} height="100px" className="rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton height="320px" className="rounded-3xl" />
          <Skeleton height="320px" className="rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-left">
        <ErrorState
          title="Dashboard Telemetry Error"
          description={error || 'Could not fetch system metrics from backend.'}
          onRetry={fetchStats}
        />
      </div>
    );
  }

  const { kpis, userGrowth, moodDistribution, popularGenres, mostReviewedMovies, userActivity } = data;

  return (
    <div className="space-y-10 text-left">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="amber" size="md" className="mb-2">
            FR-12: System Governance
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            System Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time metrics, user growth, emotional distribution, and recommendation KPIs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/analytics"
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <span>Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards with Trend Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-[#11141e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Users</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{kpis.totalUsers.value}</p>
          <span className="text-[10px] text-emerald-400 font-semibold block">{kpis.totalUsers.change} this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#11141e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Catalog Films</span>
            <Film className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{kpis.totalMovies.value}</p>
          <span className="text-[10px] text-slate-400 block">{kpis.totalMovies.change} active</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#11141e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Reviews</span>
            <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{kpis.totalReviews.value}</p>
          <span className="text-[10px] text-emerald-400 font-semibold block">{kpis.totalReviews.change}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#11141e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Recommendations</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{kpis.totalRecommendations.value}</p>
          <span className="text-[10px] text-emerald-400 font-semibold block">{kpis.totalRecommendations.change}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#11141e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Users</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{kpis.activeUsers.value}</p>
          <span className="text-[10px] text-emerald-400 font-semibold block">{kpis.activeUsers.change}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#11141e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Top Mood</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-amber-300">{kpis.popularMood.value}</p>
          <span className="text-[10px] text-slate-400 block truncate">{kpis.popularMood.change}</span>
        </div>
      </div>

      {/* Row 1: User Growth (Area) & Mood Distribution (Donut Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Growth */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#11141e] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>User Growth & Weekly Activity</span>
            </h3>
            <span className="text-xs text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area type="monotone" dataKey="users" name="Total Registered" stroke="#f43f5e" fill="url(#userGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="active" name="Active Daily" stroke="#8b5cf6" fill="url(#activeGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="p-6 rounded-3xl bg-[#11141e] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Mood Query Breakdown</span>
            </h3>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            {moodDistribution.slice(0, 4).map((m) => (
              <div key={m.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-slate-300 truncate">{m.name} ({m.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Popular Genres (Bar) & Most Reviewed Movies (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Genres */}
        <div className="p-6 rounded-3xl bg-[#11141e] border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-400" />
            <span>Popular Genres in Mood Matches</span>
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularGenres}>
                <XAxis dataKey="genre" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" name="Queries" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Reviewed Movies */}
        <div className="p-6 rounded-3xl bg-[#11141e] border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <span>Most Reviewed Titles</span>
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostReviewedMovies} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="title" type="category" stroke="#64748b" fontSize={10} width={130} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="reviews" name="Reviews Count" fill="#f43f5e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent System Activity List */}
      <div className="p-6 rounded-3xl bg-[#11141e] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Recent Administrative Log</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white font-medium">New user registered:</span>
              <span className="text-slate-400">elena.rostova@cinema.org</span>
            </div>
            <span className="text-slate-500">10 mins ago</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-white font-medium">Review submitted:</span>
              <span className="text-slate-400">Demo Student on "Sunny Side Boulevard"</span>
            </div>
            <span className="text-slate-500">25 mins ago</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-white font-medium">Flagged spam account blocked:</span>
              <span className="text-slate-400">bot404@clickbait.xyz</span>
            </div>
            <span className="text-slate-500">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
