-- 1) Drop deprecated streak/goal columns from habits
ALTER TABLE public.habits
  DROP COLUMN IF EXISTS streak_interval,
  DROP COLUMN IF EXISTS streak_count,
  DROP COLUMN IF EXISTS current_streak,
  DROP COLUMN IF EXISTS best_streak,
  DROP COLUMN IF EXISTS last_completed_on;

-- 2) Drop completions_log table (legacy row-per-day design)
-- First drop RLS policies
DROP POLICY IF EXISTS "Users can create their own completions" ON public.completions_log;
DROP POLICY IF EXISTS "Users can delete their own completions" ON public.completions_log;
DROP POLICY IF EXISTS "Users can view their own completions" ON public.completions_log;
DROP TABLE IF EXISTS public.completions_log;
