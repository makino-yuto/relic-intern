import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, subMonths, addMonths, setMonth, setYear, getYear, getMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, PenLine, ChevronDown } from 'lucide-react';
import { moodConfig } from '../data/mockData';
import { DiaryEntry, Page } from '../types/diary';
import DiaryCard from '../components/DiaryCard';
import DiaryDetailModal from '../components/DiaryDetailModal';

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

interface CalendarPageProps {
  entries: DiaryEntry[];
  onNavigate: (page: Page) => void;
  onEdit: (entry: DiaryEntry) => void;
}

export default function CalendarPage({ entries, onNavigate, onEdit }: CalendarPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(getYear(new Date()));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(e => e.date === dateStr);
  };

  const selectedDateEntry = selectedDate ? getEntryForDate(selectedDate) : null;

  const handlePickerSelect = (month: number) => {
    setCurrentMonth(setMonth(setYear(currentMonth, pickerYear), month));
    setPickerOpen(false);
  };

  const handleHeaderClick = () => {
    setPickerYear(getYear(currentMonth));
    setPickerOpen(v => !v);
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="max-w-lg mx-auto px-4">
        <header className="pt-12 pb-4">
          <h1 className="text-2xl font-semibold text-foreground">カレンダー</h1>
        </header>

        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <button
              onClick={() => { setCurrentMonth(subMonths(currentMonth, 1)); setPickerOpen(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleHeaderClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
            >
              <h2 className="text-base font-semibold text-foreground">
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </h2>
              <ChevronDown
                size={15}
                className={`text-muted-foreground transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <button
              onClick={() => { setCurrentMonth(addMonths(currentMonth, 1)); setPickerOpen(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {pickerOpen && (
            <div className="border-b border-border/40 bg-muted/20 page-transition">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() => setPickerYear(y => y - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-foreground">{pickerYear}年</span>
                <button
                  onClick={() => setPickerYear(y => y + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 px-4 pb-4">
                {monthNames.map((name, i) => {
                  const isCurrentlySelected = pickerYear === getYear(currentMonth) && i === getMonth(currentMonth);
                  return (
                    <button
                      key={i}
                      onClick={() => handlePickerSelect(i)}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${
                        isCurrentlySelected
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="px-3 py-2">
            <div className="grid grid-cols-7 mb-1">
              {weekdays.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium py-1.5 ${
                    i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {days.map((day) => {
                const entry = getEntryForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const dayOfWeek = getDay(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(isSameDay(day, selectedDate || new Date('1900-01-01')) && selectedDate ? null : day)}
                    className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-primary/10 ring-2 ring-primary/30'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isTodayDate
                        ? 'bg-primary text-primary-foreground'
                        : isSelected
                        ? 'text-primary'
                        : dayOfWeek === 0
                        ? 'text-red-400'
                        : dayOfWeek === 6
                        ? 'text-blue-400'
                        : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {entry && (
                      <span className="text-[11px] leading-none mt-0.5">
                        {moodConfig[entry.mood].emoji}
                      </span>
                    )}
                    {!entry && <span className="h-3.5" />}
                    {(entry?.photos?.length ?? 0) > 0 && (
                      <span className="w-1 h-1 rounded-full bg-primary/60 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-3 bg-muted/20 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-[9px]">1</span>
              </div>
              今日
            </div>
            <div className="flex items-center gap-1.5">
              <span>😄</span>
              気分マーク
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" />
              写真あり
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="page-transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                {format(selectedDate, 'M月d日（E）', { locale: ja })}
              </h3>
              {!selectedDateEntry && (
                <button
                  onClick={() => onNavigate('write')}
                  className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <PenLine size={12} />
                  この日の日記を書く
                </button>
              )}
            </div>
            {selectedDateEntry ? (
              <DiaryCard
                entry={selectedDateEntry}
                onClick={() => setSelectedEntry(selectedDateEntry)}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-2xl mb-2">📝</p>
                <p className="text-sm text-muted-foreground">この日の日記はまだありません</p>
              </div>
            )}
          </div>
        )}

        {!selectedDate && (
          <div className="bg-white rounded-2xl border border-border/60 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">今月の統計</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center p-3 bg-primary/8 rounded-xl" style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}>
                <p className="text-2xl font-bold text-primary">
                  {entries.filter(e => e.date.startsWith(format(currentMonth, 'yyyy-MM'))).length}
                </p>
                <p className="text-xs text-muted-foreground">記録した日</p>
              </div>
              <div className="flex-1 text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{days.length}</p>
                <p className="text-xs text-muted-foreground">今月の日数</p>
              </div>
              <div className="flex-1 text-center p-3 bg-green-50 rounded-xl">
                <p className="text-xl font-bold text-green-600">
                  {Math.round(entries.filter(e => e.date.startsWith(format(currentMonth, 'yyyy-MM'))).length / days.length * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">記録率</p>
              </div>
            </div>
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
        />
      )}
    </div>
  );
}
