do $$
begin
  create type public.goal_period_type as enum ('day', 'week', 'month');
exception
  when duplicate_object then null;
end
$$;

alter table public.habit_goal_versions
drop constraint if exists habit_goal_versions_period_type_check;

alter table public.habit_goal_versions
alter column period_type type public.goal_period_type
using period_type::public.goal_period_type;

drop function if exists public.get_habits_overview(date, date);

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
  goal_period_type public.goal_period_type,
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
