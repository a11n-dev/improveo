-- Profiles fixture rows linked to seeded auth users.

insert into public.profiles (id, username)
select
  auth_user.id,
  'member1' as username
from auth.users auth_user
where auth_user.email = 'member1@example.test'
on conflict (id) do update
set
  username = excluded.username,
  updated_at = now();

insert into public.profiles (id, username)
select
  auth_user.id,
  'member2' as username
from auth.users auth_user
where auth_user.email = 'member2@example.test'
on conflict (id) do update
set
  username = excluded.username,
  updated_at = now();
