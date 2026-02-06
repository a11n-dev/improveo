alter table if exists public.completions rename to completions_log;

create table if not exists public.completions (
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null,
  year int not null,
  bitmap bytea not null,
  updated_at timestamptz not null default now(),
  constraint completions_unique_habit_year unique (habit_id, year)
);

alter table public.completions enable row level security;

create policy "completions_select_own" on public.completions
  for select using (user_id = auth.uid());

create policy "completions_insert_own" on public.completions
  for insert with check (user_id = auth.uid());

create policy "completions_update_own" on public.completions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "completions_delete_own" on public.completions
  for delete using (user_id = auth.uid());

create or replace function public.set_habit_completion(
  p_habit_id uuid,
  p_user_id uuid,
  p_date date,
  p_value int
) returns void
language plpgsql
as $$
declare
  target_year int := extract(year from p_date)::int;
  bit_index int := extract(doy from p_date)::int - 1;
  zero_bitmap bytea := decode(repeat('00', 46), 'hex');
begin
  insert into public.completions (habit_id, user_id, year, bitmap, updated_at)
  values (p_habit_id, p_user_id, target_year, zero_bitmap, now())
  on conflict (habit_id, year) do nothing;

  update public.completions
  set bitmap = set_bit(bitmap, bit_index, p_value),
      updated_at = now()
  where habit_id = p_habit_id
    and user_id = p_user_id
    and year = target_year;
end;
$$;

insert into public.completions (habit_id, user_id, year, bitmap, updated_at)
select
  cl.habit_id,
  cl.user_id,
  extract(year from cl.completed_on)::int as year,
  decode(repeat('00', 46), 'hex') as bitmap,
  now()
from public.completions_log cl
group by cl.habit_id, cl.user_id, extract(year from cl.completed_on);

update public.completions c
set bitmap = set_bit(c.bitmap, extract(doy from cl.completed_on)::int - 1, 1),
    updated_at = now()
from public.completions_log cl
where c.habit_id = cl.habit_id
  and c.user_id = cl.user_id
  and c.year = extract(year from cl.completed_on)::int;
;
