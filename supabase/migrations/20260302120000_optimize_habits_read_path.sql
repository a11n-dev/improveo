create index if not exists idx_habits_user_created_at_id
  on public.habits (user_id, created_at, id);

create index if not exists idx_habit_goal_versions_active
  on public.habit_goal_versions (habit_id)
  where effective_to is null;

alter policy "Users can create their own habits"
  on public.habits
  with check (user_id = (select auth.uid()));

alter policy "Users can delete their own habits"
  on public.habits
  using (user_id = (select auth.uid()));

alter policy "Users can update their own habits"
  on public.habits
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy "Users can view their own habits"
  on public.habits
  using (user_id = (select auth.uid()));

alter policy "completions_select_own"
  on public.completions
  using (
    exists (
      select 1
      from public.habits
      where habits.id = completions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

alter policy "completions_insert_own"
  on public.completions
  with check (
    exists (
      select 1
      from public.habits
      where habits.id = completions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

alter policy "completions_update_own"
  on public.completions
  using (
    exists (
      select 1
      from public.habits
      where habits.id = completions.habit_id
        and habits.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.habits
      where habits.id = completions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

alter policy "completions_delete_own"
  on public.completions
  using (
    exists (
      select 1
      from public.habits
      where habits.id = completions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

alter policy "goal_versions_select_own"
  on public.habit_goal_versions
  using (
    exists (
      select 1
      from public.habits
      where habits.id = habit_goal_versions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

alter policy "goal_versions_insert_own"
  on public.habit_goal_versions
  with check (
    exists (
      select 1
      from public.habits
      where habits.id = habit_goal_versions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

alter policy "goal_versions_update_own"
  on public.habit_goal_versions
  using (
    exists (
      select 1
      from public.habits
      where habits.id = habit_goal_versions.habit_id
        and habits.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.habits
      where habits.id = habit_goal_versions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

alter policy "goal_versions_delete_own"
  on public.habit_goal_versions
  using (
    exists (
      select 1
      from public.habits
      where habits.id = habit_goal_versions.habit_id
        and habits.user_id = (select auth.uid())
    )
  );

create or replace function public.get_habits_overview(
  p_from date,
  p_to date
)
returns table (
  habit_id uuid,
  title text,
  description text,
  icon text,
  color text,
  created_at timestamptz,
  goal_id uuid,
  goal_period_type text,
  goal_target_count int4,
  goal_effective_from date,
  goal_effective_to date,
  completion_year int4,
  completion_bitmap text,
  completion_week_counts text,
  completion_month_counts text
)
language sql
stable
security invoker
set search_path = public
as $function$
  select
    habits.id as habit_id,
    habits.title,
    habits.description,
    habits.icon,
    habits.color,
    habits.created_at,
    active_goal.id as goal_id,
    active_goal.period_type as goal_period_type,
    active_goal.target_count as goal_target_count,
    active_goal.effective_from as goal_effective_from,
    active_goal.effective_to as goal_effective_to,
    completions.year as completion_year,
    completions.bitmap::text as completion_bitmap,
    completions.week_counts::text as completion_week_counts,
    completions.month_counts::text as completion_month_counts
  from public.habits
  left join lateral (
    select
      habit_goal_versions.id,
      habit_goal_versions.period_type,
      habit_goal_versions.target_count,
      habit_goal_versions.effective_from,
      habit_goal_versions.effective_to
    from public.habit_goal_versions
    where habit_goal_versions.habit_id = habits.id
      and habit_goal_versions.effective_to is null
    order by
      habit_goal_versions.effective_from desc,
      habit_goal_versions.created_at desc
    limit 1
  ) as active_goal on true
  left join public.completions
    on completions.habit_id = habits.id
   and completions.year between extract(year from p_from)::int and extract(year from p_to)::int
  where habits.user_id = (select auth.uid())
  order by habits.created_at asc, completions.year asc;
$function$;
