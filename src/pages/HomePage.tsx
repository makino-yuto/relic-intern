import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Flame, PenLine, ChevronRight, Sparkles } from 'lucide-react';
import { DiaryEntry, Page } from '../types/diary';
import DiaryCard from '../components/DiaryCard';
import DiaryDetailModal from '../components/DiaryDetailModal';

interface HomePageProps {
  entries: DiaryEntry[];
  onNavigate: (page: Page) => void;
  onEdit: (entry: DiaryEntry) => void;
}

export default function HomePage({ entries, onNavigate, onEdit }: HomePageProps) {
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayEntry = entries.find(e => e.date === todayStr);
  const recentEntries = entries.filter(e => e.date !== todayStr).slice(0, 3);
  const currentMonthStr = format(today, 'yyyy-MM');
  const monthEntries = entries.filter(e => e.date.startsWith(currentMonthStr));
  const photoCount = monthEntries.reduce((acc, e) => acc + e.photos.length, 0);
  const topMood = (() => {
    const counts: Record<string, number> = {};
    monthEntries.forEach(e => { counts[e.mood] = (counts[e.mood] ?? 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const emojiMap: Record<string, string> = { happy: '😄', good: '😊', neutral: '😐', tired: '😴', sad: '😢' };
    return sorted.length ? emojiMap[sorted[0][0]] : '—';
  })();

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'おはようございます';
    if (hour < 17) return 'こんにちは';
    return 'こんばんは';
  };

  const streakCount = 6;

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="max-w-lg mx-auto px-4">
        <header className="pt-12 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {format(today, 'yyyy年M月d日（E）', { locale: ja })}
              </p>
              <h1 className="text-2xl font-semibold text-foreground mt-1">{greeting()}</h1>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-2xl px-3 py-2">
              <Flame size={16} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{streakCount}日</span>
            </div>
          </div>
        </header>

        <section className="mb-6">
          {todayEntry ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" />
                  今日の日記
                </h2>
              </div>
              <DiaryCard
                entry={todayEntry}
                onClick={() => setSelectedEntry(todayEntry)}
              />
            </div>
          ) : (
            <button
              onClick={() => onNavigate('write')}
              className="w-full bg-gradient-to-br from-primary to-accent rounded-2xl p-5 text-primary-foreground text-left transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-80 text-xs font-medium mb-1">今日はまだ書いていません</p>
                  <p className="text-xl font-semibold">今日の日記を書く</p>
                  <p className="opacity-70 text-xs mt-1">
                    {format(today, 'M月d日（E）', { locale: ja })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <PenLine size={22} />
                </div>
              </div>
            </button>
          )}
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">最近の日記</h2>
            <button
              onClick={() => onNavigate('list')}
              className="text-xs text-primary font-medium flex items-center gap-0.5 hover:opacity-80"
            >
              すべて見る
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentEntries.map(entry => (
              <DiaryCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelectedEntry(entry)}
                compact
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-card rounded-2xl border border-border/60 p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">今月の記録</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'hsl(var(--primary) / 0.10)' }}>
                <p className="text-2xl font-bold text-primary">{monthEntries.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">記録日数</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{photoCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">写真枚数</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{topMood}</p>
                <p className="text-xs text-muted-foreground mt-0.5">多い気分</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedEntry && (
        <DiaryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={(entry) => {
            setSelectedEntry(null);
            onEdit(entry);
          }}
        />
      )}
    </div>
  );
}
