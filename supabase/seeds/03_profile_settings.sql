-- Profile settings fixture rows linked to seeded profiles.

insert into public.profile_settings (id, color_mode, week_start)
select
  profile.id,
  'system' as color_mode,
  0 as week_start
from public.profiles profile
where profile.email = 'member1@example.test'
on conflict (id) do update
set
  color_mode = excluded.color_mode,
  week_start = excluded.week_start,
  updated_at = now();

insert into public.profile_settings (id, color_mode, week_start)
select
  profile.id,
  'light' as color_mode,
  1 as week_start
from public.profiles profile
where profile.email = 'member2@example.test'
on conflict (id) do update
set
  color_mode = excluded.color_mode,
  week_start = excluded.week_start,
  updated_at = now();
