import { X, Tag, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { DiaryEntry } from '../types/diary';
import { moodConfig, weatherConfig } from '../data/mockData';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState } from 'react';

interface DiaryDetailModalProps {
  entry: DiaryEntry;
  onClose: () => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete?: (id: string) => void;
}

export default function DiaryDetailModal({ entry, onClose, onEdit, onDelete }: DiaryDetailModalProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const mood = moodConfig[entry.mood];
  const weather = weatherConfig[entry.weather];
  const date = parseISO(entry.date);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto page-transition">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/40">
          <div>
            <p className="text-xs text-muted-foreground">
              {format(date, 'yyyy年M月d日（E）', { locale: ja })}
            </p>
            <h2 className="text-lg font-semibold text-foreground mt-0.5">{entry.title || '無題'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {entry.photos.length > 0 && (
          <div className="relative bg-black">
            <img
              src={entry.photos[photoIndex]}
              alt=""
              className="w-full h-64 object-cover"
            />
            {entry.photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                  disabled={photoIndex === 0}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPhotoIndex(Math.min(entry.photos.length - 1, photoIndex + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                  disabled={photoIndex === entry.photos.length - 1}
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {entry.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${mood.bg}`}>
              {mood.emoji} {mood.label}
            </span>
            <span className="text-sm text-muted-foreground">
              {weather.icon} {weather.label}
            </span>
          </div>

          <p className="text-foreground leading-[1.8] text-sm whitespace-pre-wrap">{entry.content}</p>

          {entry.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Tag size={13} className="text-muted-foreground/60" />
              {entry.tags.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => onEdit(entry)}
            className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            編集する
          </button>
        </div>
      </div>
    </div>
  );
}
