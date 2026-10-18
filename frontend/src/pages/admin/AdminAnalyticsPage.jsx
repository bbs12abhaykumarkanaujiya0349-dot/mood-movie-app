import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Smile,
  Calendar,
  Sparkles,
  Users,
  Film,
  MessageSquare
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
  Tooltip,
  Legend
} from 'recharts';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#0e111a] border border-slate-700/80 p-3 shadow-2xl text-xs text-left space-y-1 z-30">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="flex items-center gap-1.5" style={{ color: entry.color || entry.fill || '#f43f5e' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || '#f43f5e' }} />
            <span>{entry.name}:</span>
            <strong className="text-white ml-auto">{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedRange) => {
    setLoading(true);
    try {
      const result = await adminService.getAnalytics(selectedRange);
      setData(result);
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const rangeButtons = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl shadow-black/40">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">
            System Telemetry & Trends
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            Application Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Deep-dive visualization of user growth, mood distributions, genre affinities, and sentiment.
          </p>
        </div>

        {/* Date-Range Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          {rangeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setRange(btn.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                range === btn.key
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton height="90px" className="rounded-2xl" />
            <Skeleton height="90px" className="rounded-2xl" />
            <Skeleton height="90px" className="rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton height="340px" className="rounded-3xl" />
            <Skeleton height="340px" className="rounded-3xl" />
            <Skeleton height="340px" className="rounded-3xl" />
            <Skeleton height="340px" className="rounded-3xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Glance for Selected Period */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(data.kpis).map(([key, item]) => {
              const labelMap = {
                totalUsers: 'Total Users',
                totalMovies: 'Total Titles',
                totalReviews: 'Reviews Logged',
                totalRecommendations: 'Mood Runs',
                activeUsers: 'Active Cohort',
                popularMood: 'Top Mood'
              };

              return (
                <div
                  key={key}
                  className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/80 shadow-md space-y-1"
                >
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">
                    {labelMap[key] || key}
                  </p>
                  <p className="text-xl font-black text-white font-display">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-400 block truncate">
                    {item.change}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Charts Row 1: User Growth & Mood Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: User Growth & Activity */}
            <div className="p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                    <span>User Growth & Active Cohort ({range})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cumulative registered users vs. active mood seekers
                  </p>
                </div>
                <Badge variant="rose" size="sm">Trend</Badge>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Total Users"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#growthGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      name="Active Users"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#activeGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Mood Distribution Pie/Donut */}
            <div className="p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-400" />
                    <span>Mood Query Distribution ({range})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Relative percentage share of user emotional states
                  </p>
                </div>
                <Badge variant="amber" size="sm">Mood Share</Badge>
              </div>

              <div className="h-64 w-full flex items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.moodDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {data.moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Legend Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60">
                {data.moodDistribution.map((m) => (
                  <div key={m.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="truncate">{m.name}</span>
                    <strong className="text-white ml-auto text-[11px]">{m.value}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Popular Genres & Sentiment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 3: Popular Genres */}
            <div className="p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    <span>Popular Movie Genres ({range})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Catalog categories most frequently requested
                  </p>
                </div>
                <Badge variant="purple" size="sm">Genres</Badge>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.popularGenres} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="genre" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="count" name="Queries" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Review Sentiment Breakdown */}
            <div className="p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Review Sentiment Analysis ({range})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Algorithmic sentiment scoring on community feedback
                  </p>
                </div>
                <Badge variant="emerald" size="sm">Sentiment</Badge>
              </div>

              <div className="h-64 w-full flex items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.sentimentBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {data.sentimentBreakdown.map((entry, index) => (
                        <Cell key={`cell-sent-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-around pt-2 border-t border-slate-800/60">
                {data.sentimentBreakdown.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 font-medium">{s.name}:</span>
                    <strong className="text-white font-bold">{s.value}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 3: Most Reviewed Titles & User Activity Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 5: Most Reviewed Movies */}
            <div className="p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>Top Discussed Titles ({range})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Movies generating highest review discussions
                  </p>
                </div>
                <Badge variant="amber" size="sm">Engagement</Badge>
              </div>

              <div className="space-y-3 pt-2">
                {data.mostReviewedMovies.map((movie, idx) => (
                  <div
                    key={movie.title}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">{movie.title}</p>
                        <p className="text-[11px] text-amber-400 font-semibold">★ {movie.avgRating} average rating</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white block">
                        {movie.reviews} reviews
                      </span>
                      <span className="text-[10px] text-slate-400">Total volume</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 6: Hourly Activity Heat Timeline */}
            <div className="p-6 rounded-3xl bg-[#0e111a] border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <span>Query Traffic by Hour ({range})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    User mood query patterns across 24-hour cycle
                  </p>
                </div>
                <Badge variant="rose" size="sm">Peak Hours</Badge>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.userActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="queries"
                      name="Queries"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      dot={{ fill: '#f43f5e', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
