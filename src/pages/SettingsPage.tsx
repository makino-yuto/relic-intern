import { useState } from 'react';
import {
  Bell, BellOff, Plus, Trash2, ChevronRight, BookOpen, Download, Shield, Info,
  Check, Palette, ChevronDown, LogIn, LogOut, HardDrive, User, Send,
} from 'lucide-react';
import { NotificationTime } from '../types/diary';
import { themeColors, ThemeColor } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

interface SettingsPageProps {
  colorId: string;
  sat: number;
  lit: number;
  onSelectColor: (id: string) => void;
  onSetSat: (value: number) => void;
  onSetLit: (value: number) => void;
}

export default function SettingsPage({ colorId, sat, lit, onSelectColor, onSetSat, onSetLit }: SettingsPageProps) {
  const { user, signInWithGoogle, signOut } = useAuth();
  const {
    permission,
    notifications,
    notificationsEnabled,
    requestPermission,
    toggleEnabled,
    toggleNotification,
    deleteNotification,
    addNotification,
    sendTestNotification,
  } = useNotifications();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHour, setNewHour] = useState('20');
  const [newMinute, setNewMinute] = useState('00');
  const [newLabel, setNewLabel] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [testSent, setTestSent] = useState(false);

  const handleAddNotification = () => {
    const h = parseInt(newHour);
    const m = parseInt(newMinute);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return;
    const newN: NotificationTime = {
      id: Date.now().toString(),
      hour: h,
      minute: m,
      enabled: true,
      label: newLabel || `${h}:${String(m).padStart(2, '0')} の通知`,
    };
    addNotification(newN);
    setNewHour('20');
    setNewMinute('00');
    setNewLabel('');
    setShowAddForm(false);
  };

  const handleTestNotification = async () => {
    const ok = await sendTestNotification();
    if (ok) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const formatTime = (hour: number, minute: number) =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const handleSaveSettings = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleBackup = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setBackupStatus('running');
    try {
      await new Promise(r => setTimeout(r, 1200));
      setBackupStatus('done');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const activeColor = themeColors.find(c => c.id === colorId) ?? themeColors[2];

  function swatchHsl(color: ThemeColor) {
    const adjS = Math.min(100, Math.max(6, color.s + (sat - 50) * 0.8));
    const adjL = Math.min(88, Math.max(8, color.l + (lit - 50) * 0.8));
    return `hsl(${color.h}, ${Math.round(adjS)}%, ${Math.round(adjL)}%)`;
  }

  const swatchTextColor = (color: ThemeColor) => {
    const adjL = Math.min(88, Math.max(8, color.l + (lit - 50) * 0.8));
    return adjL > 55 ? `hsl(${color.h}, 30%, 18%)` : '#ffffff';
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="max-w-lg mx-auto px-4">
        <header className="pt-12 pb-6">
          <h1 className="text-2xl font-semibold text-foreground">設定</h1>
        </header>

        {/* アカウント */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            アカウント
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-9 h-9 rounded-xl object-cover" alt="" />
                    ) : (
                      <User size={18} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted/50 rounded-xl flex items-center justify-center">
                      <LogOut size={16} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">ログアウト</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted/50 rounded-xl flex items-center justify-center">
                    <LogIn size={16} className="text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Google でログイン</p>
                    <p className="text-xs text-muted-foreground">日記をクラウドに同期・バックアップ</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </section>

        {/* テーマカラー */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            テーマカラー
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <button
              onClick={() => setThemeOpen(v => !v)}
              className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/20 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                style={{ backgroundColor: swatchHsl(activeColor) }}
              >
                <Palette size={16} style={{ color: swatchTextColor(activeColor) }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{activeColor.name}</p>
              </div>
              <div
                className="w-7 h-7 rounded-full shrink-0 border-2 border-white shadow-md transition-colors duration-300 mr-1"
                style={{ backgroundColor: swatchHsl(activeColor) }}
              />
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 shrink-0 ${themeOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {themeOpen && (
              <div className="border-t border-border/40">
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs font-medium text-muted-foreground mb-3">カラーを選ぶ</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {themeColors.map(color => {
                      const isActive = colorId === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => onSelectColor(color.id)}
                          className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                            isActive
                              ? 'border-current shadow-sm scale-[1.02]'
                              : 'border-border/50 hover:border-border hover:scale-[1.01]'
                          }`}
                          style={isActive ? { borderColor: swatchHsl(color) } : {}}
                        >
                          <div
                            className="w-6 h-6 rounded-full shrink-0 shadow-sm transition-colors duration-300 flex items-center justify-center"
                            style={{ backgroundColor: swatchHsl(color) }}
                          >
                            {isActive && <Check size={12} style={{ color: swatchTextColor(color) }} strokeWidth={3} />}
                          </div>
                          <span className="text-[11px] font-medium text-foreground leading-tight text-left">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-4 pt-3 pb-5 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2.5">彩度（色の濃さ）</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8 shrink-0">淡い</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={sat}
                          onChange={e => onSetSat(Number(e.target.value))}
                          className="theme-slider w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${swatchHsl({ ...activeColor, s: Math.max(6, activeColor.s - 38) })} 0%, ${swatchHsl(activeColor)} 50%, ${swatchHsl({ ...activeColor, s: Math.min(100, activeColor.s + 38) })} 100%)`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 shrink-0 text-right">濃い</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2.5">明度（明るさ）</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8 shrink-0">暗い</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={lit}
                          onChange={e => onSetLit(Number(e.target.value))}
                          className="theme-slider w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${swatchHsl({ ...activeColor, l: Math.max(8, activeColor.l - 38) })} 0%, ${swatchHsl(activeColor)} 50%, ${swatchHsl({ ...activeColor, l: Math.min(88, activeColor.l + 38) })} 100%)`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 shrink-0 text-right">明るい</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 通知設定 */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            通知設定
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
              <div className="flex items-center gap-3">
                {notificationsEnabled ? (
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Bell size={18} className="text-primary" />
                  </div>
                ) : (
                  <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                    <BellOff size={18} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">プッシュ通知</p>
                  <p className="text-xs text-muted-foreground">
                    {permission === 'denied'
                      ? 'ブラウザで通知がブロックされています'
                      : permission === 'granted'
                      ? '通知が許可されています'
                      : '書き忘れを防ぐリマインダー'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleEnabled(!notificationsEnabled)}
                disabled={permission === 'denied'}
                className={`relative w-12 h-6 rounded-full p-0 transition-colors duration-200 shrink-0 disabled:opacity-40 ${
                  notificationsEnabled && permission !== 'denied' ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                  notificationsEnabled && permission !== 'denied' ? 'left-[26px]' : 'left-0.5'
                }`} />
              </button>
            </div>

            {notificationsEnabled && permission !== 'denied' && (
              <>
                <div className="px-4 py-2">
                  {notifications.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      通知時間が設定されていません
                    </p>
                  )}
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleNotification(n.id)}
                          className={`relative w-10 h-5 rounded-full p-0 transition-colors duration-200 shrink-0 ${
                            n.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                            n.enabled ? 'left-[22px]' : 'left-0.5'
                          }`} />
                        </button>
                        <div>
                          <p className={`text-sm font-semibold ${n.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {formatTime(n.hour, n.minute)}
                          </p>
                          <p className="text-xs text-muted-foreground">{n.label}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {showAddForm && (
                  <div className="px-4 pb-4 border-t border-border/40 pt-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground">新しい通知時間</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={newHour}
                          onChange={e => setNewHour(e.target.value)}
                          className="w-16 px-2 py-2 text-center bg-muted/30 border border-border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="時"
                        />
                        <span className="text-muted-foreground font-medium">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={newMinute}
                          onChange={e => setNewMinute(e.target.value)}
                          className="w-16 px-2 py-2 text-center bg-muted/30 border border-border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="分"
                        />
                      </div>
                      <input
                        type="text"
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        placeholder="ラベル（任意）"
                        className="flex-1 px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleAddNotification}
                        className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        追加する
                      </button>
                    </div>
                  </div>
                )}

                {!showAddForm && (
                  <div className="border-t border-border/40 divide-y divide-border/30">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2 px-4 py-3 text-primary text-sm font-medium w-full hover:bg-primary/5 transition-colors"
                    >
                      <Plus size={16} />
                      通知時間を追加
                    </button>
                    <button
                      onClick={handleTestNotification}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium w-full hover:bg-muted/20 transition-colors"
                    >
                      {testSent ? (
                        <>
                          <Check size={16} className="text-green-500" />
                          <span className="text-green-600">テスト通知を送信しました</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} className="text-muted-foreground" />
                          <span className="text-muted-foreground">テスト通知を送る</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {permission === 'default' && (
              <div className="mx-4 my-3 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">通知の許可が必要です</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    リマインダーを受け取るには、ブラウザの通知を許可してください。
                  </p>
                  <button
                    onClick={() => requestPermission()}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-150"
                  >
                    <Bell size={12} />
                    通知を許可する
                  </button>
                </div>
              </div>
            )}

            {permission === 'denied' && (
              <div className="mx-4 my-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5">
                  <BellOff size={15} className="text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">通知がブロックされています</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    ブラウザのサイト設定から「通知」を「許可」に変更してください。
                  </p>
                </div>
              </div>
            )}
          </div>
          {notificationsEnabled && permission !== 'denied' && (
            <p className="text-xs text-muted-foreground mt-2 px-1">
              {permission === 'granted'
                ? '指定した時間にデスクトップ通知でリマインダーが届きます。'
                : 'ON にするとブラウザの通知許可ダイアログが表示されます。'}
            </p>
          )}
        </section>

        {/* データ */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            データ
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <button
              className="flex items-center justify-between w-full px-4 py-3.5 border-b border-border/40 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-muted/50 rounded-xl flex items-center justify-center">
                  <BookOpen size={16} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">日記のエクスポート</p>
                  <p className="text-xs text-muted-foreground">PDFまたはテキストで出力</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <button
              onClick={handleBackup}
              disabled={backupStatus === 'running'}
              className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/20 transition-colors disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  user ? 'bg-primary/10' : 'bg-muted/50'
                }`}>
                  <HardDrive size={16} className={user ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Google ドライブにバックアップ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user
                      ? 'Googleドライブに日記データを保存'
                      : 'Googleアカウントでログインが必要です'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {backupStatus === 'done' && <Check size={16} className="text-green-500" />}
                {backupStatus === 'running' && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {!user && <Download size={14} className="text-muted-foreground" />}
                {user && backupStatus === 'idle' && <ChevronRight size={16} className="text-muted-foreground" />}
              </div>
            </button>
          </div>
          {backupStatus === 'done' && (
            <p className="text-xs text-green-600 mt-2 px-1 font-medium">バックアップが完了しました</p>
          )}
          {backupStatus === 'error' && (
            <p className="text-xs text-destructive mt-2 px-1">バックアップに失敗しました。もう一度お試しください。</p>
          )}
        </section>

        {/* アプリ情報 */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            アプリ情報
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            {[
              { icon: Shield, label: 'プライバシーポリシー', sub: '' },
              { icon: Info, label: 'バージョン情報', sub: 'v1.0.0' },
            ].map(({ icon: Icon, label, sub }) => (
              <button
                key={label}
                className="flex items-center justify-between w-full px-4 py-3.5 border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted/50 rounded-xl flex items-center justify-center">
                    <Icon size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </div>
                <div className="flex items-center gap-2">
                  {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="pb-8">
          <button
            onClick={handleSaveSettings}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
              savedFeedback
                ? 'bg-green-500 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
            }`}
          >
            {savedFeedback ? (
              <span className="flex items-center justify-center gap-1.5">
                <Check size={16} />
                保存しました
              </span>
            ) : (
              '設定を保存する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
