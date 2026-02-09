-- Profiles fixture rows linked to seeded auth users.

insert into public.profiles (id, email, name)
select
  auth_user.id,
  auth_user.email,
  'Member #1' as name
from auth.users auth_user
where auth_user.email = 'member1@example.test'
on conflict (id) do update
set
  email = excluded.email,
  name = excluded.name,
  updated_at = now();

insert into public.profiles (id, email, name)
select
  auth_user.id,
  auth_user.email,
  'Member #2' as name
from auth.users auth_user
where auth_user.email = 'member2@example.test'
on conflict (id) do update
set
  email = excluded.email,
  name = excluded.name,
  updated_at = now();
