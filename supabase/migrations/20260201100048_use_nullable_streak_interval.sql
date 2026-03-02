ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_streak_interval_check;

ALTER TABLE habits ADD CONSTRAINT habits_streak_interval_check
  CHECK (streak_interval IS NULL OR streak_interval = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text]));

ALTER TABLE habits ALTER COLUMN streak_interval DROP NOT NULL;

ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_streak_count_check;
ALTER TABLE habits ADD CONSTRAINT habits_streak_count_check
  CHECK (
    (streak_interval IS NULL AND streak_count = 0) OR
    (streak_interval IS NOT NULL AND streak_count >= 1)
  );

UPDATE habits SET streak_interval = NULL, streak_count = 0 WHERE streak_interval = 'none';
