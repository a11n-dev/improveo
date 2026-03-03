ALTER TABLE public.habits
  DROP COLUMN IF EXISTS streak_interval,
  DROP COLUMN IF EXISTS streak_count,
  DROP COLUMN IF EXISTS current_streak,
  DROP COLUMN IF EXISTS best_streak,
  DROP COLUMN IF EXISTS last_completed_on;

DROP TABLE IF EXISTS public.completions_log CASCADE;
