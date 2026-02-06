-- Revert the 'none' changes and make streak_interval nullable instead
-- This is cleaner: NULL means "no streak tracking"

-- Drop the old constraint that included 'none'
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_streak_interval_check;

-- Add new constraint allowing only valid intervals OR NULL
ALTER TABLE habits ADD CONSTRAINT habits_streak_interval_check 
  CHECK (streak_interval IS NULL OR streak_interval = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text]));

-- Make streak_interval nullable
ALTER TABLE habits ALTER COLUMN streak_interval DROP NOT NULL;

-- Update streak_count constraint to allow 0 when interval is NULL
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_streak_count_check;
ALTER TABLE habits ADD CONSTRAINT habits_streak_count_check 
  CHECK (
    (streak_interval IS NULL AND streak_count = 0) OR
    (streak_interval IS NOT NULL AND streak_count >= 1)
  );

-- Update any existing 'none' values to NULL (if any exist)
UPDATE habits SET streak_interval = NULL, streak_count = 0 WHERE streak_interval = 'none';;
