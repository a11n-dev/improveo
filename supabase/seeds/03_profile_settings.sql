-- Profile settings fixture rows linked to seeded profiles.

insert into public.profile_settings (id, color_mode, week_start)
select
  auth_user.id,
  'system' as color_mode,
  0 as week_start
from auth.users auth_user
where auth_user.email = 'member1@example.test'
on conflict (id) do update
set
  color_mode = excluded.color_mode,
  week_start = excluded.week_start,
  updated_at = now();

insert into public.profile_settings (id, color_mode, week_start)
select
  auth_user.id,
  'light' as color_mode,
  1 as week_start
from auth.users auth_user
where auth_user.email = 'member2@example.test'
on conflict (id) do update
set
  color_mode = excluded.color_mode,
  week_start = excluded.week_start,
  updated_at = now();
