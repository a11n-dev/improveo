-- Allow 'none' as a streak interval value
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_streak_interval_check;
ALTER TABLE habits ADD CONSTRAINT habits_streak_interval_check 
  CHECK (streak_interval = ANY (ARRAY['none'::text, 'daily'::text, 'weekly'::text, 'monthly'::text]));

-- Allow streak_count to be 0 when interval is 'none'
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_streak_count_check;
ALTER TABLE habits ADD CONSTRAINT habits_streak_count_check 
  CHECK (
    (streak_interval = 'none' AND streak_count = 0) OR
    (streak_interval != 'none' AND streak_count >= 1)
  );;
