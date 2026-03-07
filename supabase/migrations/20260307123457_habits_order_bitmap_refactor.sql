alter table public.habits
  add column "order" integer;

with ranked_habits as (
  select
    id,
    (row_number() over (
      partition by user_id
      order by created_at asc nulls last, id asc
    ) - 1)::integer as habit_order
  from public.habits
)
update public.habits as habits
set "order" = ranked_habits.habit_order
from ranked_habits
where ranked_habits.id = habits.id;

alter table public.habits
  alter column "order" set not null;

alter table public.habits
  add constraint habits_order_non_negative check ("order" >= 0),
  add constraint habits_user_id_order_key unique (user_id, "order");

drop function if exists public.get_habits_overview(date, date);
drop function if exists public.set_habit_completion(uuid, date, integer, integer);
drop function if exists public.set_habit_completion(uuid, uuid, date, integer);

alter table public.completions
  add column bitmap_v2 bit(366);

update public.completions as target_completions
set bitmap_v2 = converted.bitmap_v2
from (
  select
    habit_id,
    year,
    (
      select string_agg(get_bit(source_completions.bitmap, i)::text, '' order by i)
      from generate_series(0, 365) as gs(i)
    )::bit(366) as bitmap_v2
  from public.completions as source_completions
) as converted
where converted.habit_id = target_completions.habit_id
  and converted.year = target_completions.year;

alter table public.completions
  alter column bitmap_v2 set not null;

alter table public.completions
  drop column week_counts,
  drop column month_counts,
  drop column bitmap;

alter table public.completions
  rename column bitmap_v2 to bitmap;

alter table public.completions
  alter column bitmap set default repeat('0', 366)::bit(366);

drop trigger if exists set_habits_updated_at on public.habits;

create trigger set_habits_updated_at
before update on public.habits
for each row execute function public.set_updated_at();
