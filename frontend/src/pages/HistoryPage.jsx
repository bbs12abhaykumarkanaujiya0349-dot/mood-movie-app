import React, { useState, useEffect } from 'react';
import { History, Clock, ArrowRight, Brain } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import userService from '../services/userService';

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await userService.getHistory();
        setHistoryList(data);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="py-12 sm:py-16 text-left pb-24">
      <Container>
        <div className="mb-10">
          <Badge variant="purple" size="md" className="mb-3">
            FR-11: Recommendation History
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Mood History
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            A chronological timeline of your emotional states and movie recommendation sessions.
          </p>
        </div>

        {historyList.length > 0 ? (
          <div className="space-y-4 max-w-3xl">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="amber" size="sm">
                      {item.detectedMood} Cinema
                    </Badge>
                    {item.confidence && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {Math.round(item.confidence * 100)}% match
                      </span>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-2">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium italic">
                    "{item.inputText}"
                  </p>
                </div>

                <span className="text-xs text-rose-400 font-semibold shrink-0">
                  {item.count || 12} recommendations generated
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Brain}
            title="No Mood History Recorded"
            description="Use our Natural Language Mood Matcher to analyze your feelings and record your recommendation journeys."
            actionLabel="Try Mood Matcher"
            onAction={() => window.location.assign('/mood')}
          />
        )}
      </Container>
    </div>
  );
}
