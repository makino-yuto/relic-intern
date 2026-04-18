import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { X, Camera, ImagePlus, Tag, ChevronLeft, Check } from 'lucide-react';
import { DiaryEntry, Mood, Weather } from '../types/diary';
import { moodConfig, weatherConfig } from '../data/mockData';

interface WritePageProps {
  editingEntry?: DiaryEntry | null;
  initialDate?: string | null;
  onSave: (entry: DiaryEntry) => void;
  onBack: () => void;
}

const moods: Mood[] = ['happy', 'good', 'neutral', 'tired', 'sad'];
const weathers: Weather[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];

export default function WritePage({ editingEntry, initialDate, onSave, onBack }: WritePageProps) {
  const today = initialDate || format(new Date(), 'yyyy-MM-dd');
  const [title, setTitle] = useState(editingEntry?.title || '');
  const [content, setContent] = useState(editingEntry?.content || '');
  const [mood, setMood] = useState<Mood>(editingEntry?.mood || 'neutral');
  const [weather, setWeather] = useState<Weather>(editingEntry?.weather || 'sunny');
  const [photos, setPhotos] = useState<string[]>(editingEntry?.photos || []);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(editingEntry?.tags || []);
  const [date] = useState(editingEntry?.date || today);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!content.trim() && photos.length === 0) return;
    const entry: DiaryEntry = {
      id: editingEntry?.id || Date.now().toString(),
      date,
      title,
      content,
      mood,
      weather,
      photos,
      tags,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(entry);
  };

  const dateObj = new Date(date + 'T12:00:00');
  const canSave = content.trim().length > 0 || photos.length > 0;

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="max-w-lg mx-auto">
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm px-4 pt-12 pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm">戻る</span>
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {format(dateObj, 'M月d日（E）', { locale: ja })}
              </p>
              <p className="text-xs text-muted-foreground">{editingEntry ? '編集中' : '新しい日記'}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                canSave
                  ? 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Check size={14} />
              保存
            </button>
          </div>
        </header>

        <div className="px-4 py-4 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              今日の気分
            </label>
            <div className="flex gap-2">
              {moods.map(m => {
                const cfg = moodConfig[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                      mood === m
                        ? `${cfg.bg} border-current scale-105`
                        : 'bg-white border-border/60 hover:border-border'
                    }`}
                  >
                    <span className="text-xl leading-none">{cfg.emoji}</span>
                    <span className={`text-[10px] font-medium ${mood === m ? cfg.color : 'text-muted-foreground'}`}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              今日の天気
            </label>
            <div className="flex gap-2">
              {weathers.map(w => {
                const cfg = weatherConfig[w];
                return (
                  <button
                    key={w}
                    onClick={() => setWeather(w)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                      weather === w
                        ? 'bg-sky-50 border-sky-300 scale-105'
                        : 'bg-white border-border/60 hover:border-border'
                    }`}
                  >
                    <span className="text-xl leading-none">{cfg.icon}</span>
                    <span className={`text-[10px] font-medium ${weather === w ? 'text-sky-600' : 'text-muted-foreground'}`}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              写真
            </label>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {photos.length < 9 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <ImagePlus size={18} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">追加</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoAdd}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              タイトル（任意）
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="今日のタイトル"
              className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              日記を書く
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="今日はどんな一日でしたか？&#10;思ったこと、感じたこと、なんでも書いてみましょう。"
              rows={8}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none leading-relaxed"
            />
            <p className="text-right text-xs text-muted-foreground mt-1">{content.length}文字</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              タグ
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-xl">
                <Tag size={14} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="タグを追加（例：旅行）"
                  className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <button
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-secondary/80 transition-colors"
              >
                追加
              </button>
            </div>
          </div>

          <div className="pb-4">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
                canSave
                  ? 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-lg'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              style={canSave ? { boxShadow: '0 4px 20px rgba(234,111,51,0.35)' } : {}}
            >
              {editingEntry ? '更新する' : '日記を保存する'}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden">
        <Camera />
      </div>
    </div>
  );
}
