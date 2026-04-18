import { useState, useEffect, useCallback } from 'react';

export interface ThemeColor {
  id: string;
  name: string;
  h: number;
  s: number;
  l: number;
}

export const themeColors: ThemeColor[] = [
  { id: 'cyclamen',   name: 'シクラメンピンク',     h: 330, s: 72, l: 48 },
  { id: 'fire',       name: 'ファイアーレッド',       h: 4,   s: 78, l: 44 },
  { id: 'carrot',     name: 'キャロットオレンジ',     h: 22,  s: 80, l: 48 },
  { id: 'chartreuse', name: 'シャルトルーズイエロー', h: 74,  s: 60, l: 36 },
  { id: 'forest',     name: 'フォレストグリーン',     h: 145, s: 52, l: 30 },
  { id: 'salvia',     name: 'サルビアブルー',         h: 213, s: 55, l: 44 },
  { id: 'royal',      name: 'ロイヤルパープル',       h: 272, s: 58, l: 42 },
  { id: 'vandyke',    name: 'バンダイクブラウン',     h: 21,  s: 42, l: 28 },
  { id: 'ivory',      name: 'アイボリーブラック',     h: 26,  s: 8,  l: 18 },
  { id: 'milky',      name: 'ミルキーホワイト',       h: 40,  s: 22, l: 68 },
];

const STORAGE_KEY_COLOR = 'mainichi_theme_color';
const STORAGE_KEY_SAT   = 'mainichi_theme_sat';
const STORAGE_KEY_LIT   = 'mainichi_theme_lit';
const DEFAULT_COLOR_ID  = 'carrot';
const DEFAULT_SAT       = 50;
const DEFAULT_LIT       = 50;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function applyTheme(color: ThemeColor, sat: number, lit: number) {
  const satDelta = (sat - 50) * 0.6;
  const litDelta = lit <= 50
    ? (lit - 50) * 0.7
    : (lit - 50) * 0.24;

  const adjS = clamp(color.s + satDelta, 5, 92);
  const adjL = clamp(color.l + litDelta, 8, 62);

  const root = document.documentElement;
  const isDark = adjL < 28;

  root.style.setProperty('--primary',              `${color.h} ${Math.round(adjS)}% ${Math.round(adjL)}%`);
  root.style.setProperty('--ring',                 `${color.h} ${Math.round(adjS)}% ${Math.round(adjL)}%`);
  root.style.setProperty('--accent',               `${color.h} ${Math.round(adjS * 0.7)}% ${Math.round(Math.min(adjL + 16, 78))}%`);
  root.style.setProperty('--chart-1',              `${color.h} ${Math.round(adjS)}% ${Math.round(adjL)}%`);
  root.style.setProperty('--chart-2',              `${color.h} ${Math.round(adjS * 0.75)}% ${Math.round(Math.min(adjL + 14, 78))}%`);

  const isBright = adjL > 56;
  root.style.setProperty('--primary-foreground', isBright ? `${color.h} 30% 14%` : `0 0% 100%`);

  const bgL = isDark ? clamp(adjL + 10, 18, 34) : clamp(adjL + 40, 84, 93);
  const bgS = isDark ? clamp(adjS * 0.22, 12, 24) : clamp(adjS * 0.32, 18, 34);

  root.style.setProperty('--secondary',            `${color.h} ${Math.round(Math.min(bgS + 4, 38))}% ${Math.round(Math.min(bgL + 3, 94))}%`);
  root.style.setProperty('--secondary-foreground', `${color.h} ${isDark ? 24 : 34}% ${isDark ? 88 : 22}%`);

  root.style.setProperty('--background', `${color.h} ${Math.round(bgS)}% ${Math.round(bgL)}%`);
  root.style.setProperty('--muted',      `${color.h} ${Math.round(Math.min(bgS * 1.15, 40))}% ${Math.round(isDark ? bgL + 5 : bgL - 3)}%`);
  root.style.setProperty('--border',     `${color.h} ${Math.round(Math.min(bgS * 1.45, 46))}% ${Math.round(isDark ? bgL + 10 : bgL - 9)}%`);
  root.style.setProperty('--input',      `${color.h} ${Math.round(Math.min(bgS * 1.45, 46))}% ${Math.round(isDark ? bgL + 10 : bgL - 9)}%`);
  root.style.setProperty('--card',       `${color.h} ${Math.round(Math.max(bgS * 0.7, 12))}% ${Math.round(isDark ? adjL + 12 : Math.min(bgL + 5, 96))}%`);

  const fgL = isDark ? 90 : Math.max(adjL - 42, 10);
  root.style.setProperty('--foreground',       isDark ? `${color.h} 8% 90%`  : `${color.h} 22% ${Math.round(fgL)}%`);
  root.style.setProperty('--card-foreground',  isDark ? `${color.h} 8% 88%`  : `${color.h} 22% ${Math.round(fgL)}%`);
  root.style.setProperty('--muted-foreground', isDark ? `${color.h} 6% 62%`  : `${color.h} 10% ${Math.round(fgL + 28)}%`);
}

export function useTheme() {
  const [colorId, setColorId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY_COLOR) ?? DEFAULT_COLOR_ID
  );
  const [sat, setSatState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SAT);
    return stored ? parseInt(stored, 10) : DEFAULT_SAT;
  });
  const [lit, setLitState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_LIT);
    return stored ? parseInt(stored, 10) : DEFAULT_LIT;
  });

  const activeColor = themeColors.find(c => c.id === colorId) ?? themeColors[2];

  useEffect(() => {
    applyTheme(activeColor, sat, lit);
  }, [activeColor, sat, lit]);

  const selectColor = useCallback((id: string) => {
    setColorId(id);
    localStorage.setItem(STORAGE_KEY_COLOR, id);
  }, []);

  const setSat = useCallback((value: number) => {
    setSatState(value);
    localStorage.setItem(STORAGE_KEY_SAT, String(value));
  }, []);

  const setLit = useCallback((value: number) => {
    setLitState(value);
    localStorage.setItem(STORAGE_KEY_LIT, String(value));
  }, []);

  return { colorId, sat, lit, activeColor, selectColor, setSat, setLit };
}
