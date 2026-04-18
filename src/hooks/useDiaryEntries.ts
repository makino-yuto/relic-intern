import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DiaryEntry } from '../types/diary';
import { useAuth } from '../contexts/AuthContext';
import { mockEntries } from '../data/mockData';

export function useDiaryEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>(mockEntries);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries(mockEntries);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setEntries(data.map(row => ({
        id: row.id,
        date: row.date,
        title: row.title,
        content: row.content,
        mood: row.mood,
        weather: row.weather,
        photos: row.photos ?? [],
        tags: row.tags ?? [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const saveEntry = useCallback(async (entry: DiaryEntry) => {
    if (!user) return;
    const existing = entries.find(e => e.id === entry.id);
    if (existing) {
      await supabase.from('diary_entries').update({
        date: entry.date,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        weather: entry.weather,
        photos: entry.photos,
        tags: entry.tags,
        updated_at: new Date().toISOString(),
      }).eq('id', entry.id).eq('user_id', user.id);
    } else {
      await supabase.from('diary_entries').insert({
        id: entry.id,
        user_id: user.id,
        date: entry.date,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        weather: entry.weather,
        photos: entry.photos,
        tags: entry.tags,
      });
    }
    await fetchEntries();
  }, [user, entries, fetchEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('diary_entries').delete().eq('id', id).eq('user_id', user.id);
    await fetchEntries();
  }, [user, fetchEntries]);

  return { entries, loading, saveEntry, deleteEntry, refetch: fetchEntries };
}
