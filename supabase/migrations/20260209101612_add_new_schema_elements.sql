ALTER TABLE public.profiles
  ADD COLUMN timezone text NOT NULL DEFAULT 'UTC';

CREATE TABLE public.habit_goal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('day', 'week', 'month')),
  target_count int4 NOT NULL CHECK (target_count >= 1),
  effective_from date NOT NULL,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_habit_goal_versions_lookup
  ON public.habit_goal_versions (habit_id, effective_from DESC);

ALTER TABLE public.habit_goal_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goal_versions_select_own" ON public.habit_goal_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_goal_versions.habit_id AND habits.user_id = auth.uid())
  );

CREATE POLICY "goal_versions_insert_own" ON public.habit_goal_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_goal_versions.habit_id AND habits.user_id = auth.uid())
  );

CREATE POLICY "goal_versions_update_own" ON public.habit_goal_versions
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_goal_versions.habit_id AND habits.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_goal_versions.habit_id AND habits.user_id = auth.uid())
  );

CREATE POLICY "goal_versions_delete_own" ON public.habit_goal_versions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_goal_versions.habit_id AND habits.user_id = auth.uid())
  );

ALTER TABLE public.completions
  ADD COLUMN week_counts bytea NOT NULL DEFAULT decode(repeat('00', 53), 'hex'),
  ADD COLUMN month_counts bytea NOT NULL DEFAULT decode(repeat('00', 12), 'hex');
