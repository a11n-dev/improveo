
-- Habits table
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon text NOT NULL,
  color text NOT NULL,
  streak_interval text NOT NULL CHECK (streak_interval IN ('daily', 'weekly', 'monthly')),
  streak_count int NOT NULL CHECK (streak_count >= 1),
  current_streak int NOT NULL DEFAULT 0,
  best_streak int NOT NULL DEFAULT 0,
  last_completed_on date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Completions table
CREATE TABLE completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_on date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Unique index on completions (habit_id, completed_on) - one completion per day per habit
CREATE UNIQUE INDEX idx_completions_habit_date ON completions(habit_id, completed_on);

-- Index on completions for efficient user queries by date range
CREATE INDEX idx_completions_user_date ON completions(user_id, completed_on);

-- Add week_start column to profiles
ALTER TABLE profiles ADD COLUMN week_start smallint NOT NULL DEFAULT 0 
  CHECK (week_start BETWEEN 0 AND 6);

-- Comment: week_start mapping: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
COMMENT ON COLUMN profiles.week_start IS 'Week start day: 0 = Sunday, 1 = Monday, ..., 6 = Saturday';
;
