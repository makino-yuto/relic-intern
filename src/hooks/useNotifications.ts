import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationTime } from '../types/diary';

const STORAGE_KEY = 'diary_notifications';
const ENABLED_KEY = 'diary_notifications_enabled';

function loadNotifications(): NotificationTime[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: '1', hour: 8, minute: 0, enabled: true, label: '朝の記録' },
    { id: '2', hour: 21, minute: 0, enabled: true, label: '夜の振り返り' },
  ];
}

function saveNotifications(notifications: NotificationTime[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function msUntilNextTrigger(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [notifications, setNotifications] = useState<NotificationTime[]>(loadNotifications);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(ENABLED_KEY);
    if (stored === null) {
      return typeof Notification !== 'undefined' && Notification.permission === 'granted';
    }
    return stored === 'true';
  });

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const scheduleNotification = useCallback((n: NotificationTime) => {
    if (!notificationsEnabled || !n.enabled || permission !== 'granted') return;

    const existing = timersRef.current.get(n.id);
    if (existing) clearTimeout(existing);

    const fire = () => {
      new Notification('日記を書く時間です', {
        body: n.label,
        icon: '/favicon.ico',
        tag: `diary-reminder-${n.id}`,
      });
      const nextTimer = setTimeout(fire, 24 * 60 * 60 * 1000);
      timersRef.current.set(n.id, nextTimer);
    };

    const delay = msUntilNextTrigger(n.hour, n.minute);
    const timer = setTimeout(fire, delay);
    timersRef.current.set(n.id, timer);
  }, [notificationsEnabled, permission]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current.clear();
  }, []);

  useEffect(() => {
    clearAllTimers();
    if (notificationsEnabled && permission === 'granted') {
      notifications.forEach(n => scheduleNotification(n));
    }
    return clearAllTimers;
  }, [notifications, notificationsEnabled, permission, scheduleNotification, clearAllTimers]);

  const updateNotifications = useCallback((updated: NotificationTime[]) => {
    setNotifications(updated);
    saveNotifications(updated);
  }, []);

  const toggleEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const currentPermission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      if (currentPermission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }
    }
    setNotificationsEnabled(enabled);
    localStorage.setItem(ENABLED_KEY, String(enabled));
  }, [requestPermission]);

  const toggleNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);
    timersRef.current.delete(id);
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const addNotification = useCallback((n: NotificationTime) => {
    setNotifications(prev => {
      const updated = [...prev, n].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const sendTestNotification = useCallback(async () => {
    const granted = permission === 'granted' || await requestPermission();
    if (!granted) return false;
    new Notification('テスト通知', {
      body: '日記アプリからのテスト通知です',
      icon: '/favicon.ico',
      tag: 'diary-test',
    });
    return true;
  }, [permission, requestPermission]);

  return {
    permission,
    notifications,
    notificationsEnabled,
    requestPermission,
    toggleEnabled,
    toggleNotification,
    deleteNotification,
    addNotification,
    updateNotifications,
    sendTestNotification,
  };
}
