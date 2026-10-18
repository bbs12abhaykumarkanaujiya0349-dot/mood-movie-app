import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function AdminAnalyticsPage() {
  const moodBreakdown = [
    { mood: 'Happy', count: 320, pct: '32%' },
    { mood: 'Excited', count: 240, pct: '24%' },
    { mood: 'Relaxed', count: 180, pct: '18%' },
    { mood: 'Sad', count: 110, pct: '11%' },
    { mood: 'Romantic', count: 90, pct: '9%' },
    { mood: 'Motivated', count: 60, pct: '6%' }
  ];

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

        <div className="mb-8">
          <Badge variant="purple" size="md" className="mb-3">
            Analytics
          </Badge>
          <h1 className="text-3xl font-extrabold text-white">Application Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Aggregated mood distribution and query behavior.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mood Popularity Distribution */}
          <div className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              <span>Mood Query Breakdown</span>
            </h3>

            <div className="space-y-3 pt-2">
              {moodBreakdown.map((item) => (
                <div key={item.mood} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.mood}</span>
                    <span className="text-slate-400">{item.count} queries ({item.pct})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Performance Status */}
          <div className="p-6 rounded-2xl bg-[#11141e] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>API & Cache Health</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300 pt-2">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Recommendation Latency</span>
                <span className="font-semibold text-emerald-400">~120ms (P95)</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Fallback Resilience</span>
                <span className="font-semibold text-emerald-400">100% Guaranteed</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">TMDb Rate Limit Remaining</span>
                <span className="font-semibold text-amber-400">Local Mock Mode</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
