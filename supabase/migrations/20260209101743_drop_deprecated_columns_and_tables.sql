-- 1) Drop deprecated streak/goal columns from habits
ALTER TABLE public.habits
  DROP COLUMN IF EXISTS streak_interval,
  DROP COLUMN IF EXISTS streak_count,
  DROP COLUMN IF EXISTS current_streak,
  DROP COLUMN IF EXISTS best_streak,
  DROP COLUMN IF EXISTS last_completed_on;

-- 2) Drop completions_log table (legacy row-per-day design)
-- Using CASCADE automatically removes dependent policies and constraints
DROP TABLE IF EXISTS public.completions_log CASCADE;
