import React from 'react';
import { History, Clock, ArrowRight } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';

export default function HistoryPage() {
  const mockHistory = [
    {
      id: 1,
      inputText: 'Feeling exhausted and want something uplifting',
      detectedMood: 'Happy',
      date: 'Today, 2:30 PM',
      count: 6
    },
    {
      id: 2,
      inputText: 'Need high-octane excitement and sci-fi adrenaline',
      detectedMood: 'Excited',
      date: 'Yesterday, 9:15 PM',
      count: 8
    }
  ];

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        <div className="mb-10">
          <Badge variant="purple" size="md" className="mb-3">
            FR-11: Recommendation History
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Mood History
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            A chronological timeline of your emotional states and movie recommendations.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl">
          {mockHistory.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-[#11141e]/80 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="amber" size="sm">
                    {item.detectedMood}
                  </Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>
                <p className="text-sm text-white font-medium italic">
                  "{item.inputText}"
                </p>
              </div>

              <span className="text-xs text-rose-400 font-semibold shrink-0">
                {item.count} matched
              </span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
