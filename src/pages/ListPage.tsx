import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { DiaryEntry, Mood } from '../types/diary';
import DiaryCard from '../components/DiaryCard';
import DiaryDetailModal from '../components/DiaryDetailModal';

interface ListPageProps {
  entries: DiaryEntry[];
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
}

const moodFilters: { id: Mood | 'all'; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'happy', label: '😄 最高' },
  { id: 'good', label: '😊 よい' },
  { id: 'neutral', label: '😐 普通' },
  { id: 'tired', label: '😴 疲れた' },
  { id: 'sad', label: '😢 悲しい' },
];

export default function ListPage({ entries, onEdit, onDelete }: ListPageProps) {
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState<Mood | 'all'>('all');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = entries.filter(entry => {
    const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || (
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      entry.tags.some(t => t.toLowerCase().includes(q))
    );
    return matchesMood && matchesSearch;
  });

  const grouped = filtered.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
    const month = format(parseISO(entry.date), 'yyyy年M月', { locale: ja });
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="max-w-lg mx-auto px-4">
        <header className="pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">日記一覧</h1>
            <span className="text-sm text-muted-foreground">{filtered.length}件</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border rounded-xl">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="検索"
                className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                moodFilter !== 'all'
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground'
              }`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide pb-1">
              {moodFilters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setMoodFilter(f.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    moodFilter === f.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-muted-foreground text-sm">
              {search || moodFilter !== 'all' ? '検索条件に一致する日記がありません' : '日記がまだありません'}
            </p>
            {(search || moodFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setMoodFilter('all'); }}
                className="mt-3 text-primary text-sm font-medium"
              >
                条件をリセット
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            {Object.entries(grouped).map(([month, groupEntries]) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">{month}</h2>
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground">{groupEntries.length}件</span>
                </div>
                <div className="space-y-3">
                  {groupEntries.map(entry => (
                    <DiaryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => setSelectedEntry(entry)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEntry && (
        <DiaryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={(entry) => {
            setSelectedEntry(null);
            onEdit(entry);
          }}
          onDelete={(id) => {
            setSelectedEntry(null);
            onDelete(id);
          }}
        />
      )}
    </div>
  );
}
