import { DiaryEntry } from '../types/diary';
import { moodConfig, weatherConfig } from '../data/mockData';
import { Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DiaryCardProps {
  entry: DiaryEntry;
  onClick?: () => void;
  compact?: boolean;
}

export default function DiaryCard({ entry, onClick, compact = false }: DiaryCardProps) {
  const mood = moodConfig[entry.mood];
  const weather = weatherConfig[entry.weather];
  const date = parseISO(entry.date);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-border/60 overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]' : ''
      }`}
    >
      {entry.photos.length > 0 && !compact && (
        <div className="relative">
          <div className={`grid gap-0.5 ${
            entry.photos.length === 1 ? 'grid-cols-1' :
            entry.photos.length === 2 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {entry.photos.slice(0, 3).map((photo, i) => (
              <div
                key={i}
                className={`relative overflow-hidden ${
                  entry.photos.length === 1 ? 'h-48' : 'h-32'
                }`}
              >
                <img
                  src={photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {i === 2 && entry.photos.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{entry.photos.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {format(date, 'M月d日（E）', { locale: ja })}
            </span>
            <span className="text-sm" title={weather.label}>{weather.icon}</span>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mood.bg}`}
          >
            {mood.emoji} {mood.label}
          </span>
        </div>

        {entry.title && (
          <h3 className={`font-semibold text-foreground mb-1.5 ${compact ? 'text-sm' : 'text-base'}`}>
            {entry.title}
          </h3>
        )}

        <p className={`text-muted-foreground leading-relaxed ${
          compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'
        }`}>
          {entry.content}
        </p>

        {entry.tags.length > 0 && !compact && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <Tag size={11} className="text-muted-foreground/60" />
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
