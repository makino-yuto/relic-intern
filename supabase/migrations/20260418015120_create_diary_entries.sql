/*
  # Create diary entries table

  1. New Tables
    - `diary_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `date` (text, YYYY-MM-DD)
      - `title` (text)
      - `content` (text)
      - `mood` (text)
      - `weather` (text)
      - `photos` (text array)
      - `tags` (text array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on diary_entries
    - Users can only read/write their own entries
*/

CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date text NOT NULL,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  mood text NOT NULL DEFAULT 'neutral',
  weather text NOT NULL DEFAULT 'sunny',
  photos text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own diary entries"
  ON diary_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries"
  ON diary_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries"
  ON diary_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries"
  ON diary_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS diary_entries_user_date ON diary_entries(user_id, date DESC);
