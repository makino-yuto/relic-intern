export type Mood = 'happy' | 'good' | 'neutral' | 'tired' | 'sad';

export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: Mood;
  weather: Weather;
  photos: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTime {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
}

export interface AppSettings {
  notifications: NotificationTime[];
  notificationsEnabled: boolean;
}

export type Page = 'home' | 'write' | 'calendar' | 'list' | 'settings';

export interface AppState {
  currentPage: Page;
  editingEntry: DiaryEntry | null;
  selectedDate: string | null;
}
