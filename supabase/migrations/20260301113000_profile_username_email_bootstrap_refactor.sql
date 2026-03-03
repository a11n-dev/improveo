do $$
begin
  if not exists (
    select 1
    from pg_type enum_type
    join pg_namespace schema_namespace
      on schema_namespace.oid = enum_type.typnamespace
    where schema_namespace.nspname = 'public'
      and enum_type.typname = 'color_mode_preference'
  ) then
    create type public.color_mode_preference as enum ('light', 'dark', 'system');
  end if;
end;
$$;

alter table public.profile_settings
  drop constraint if exists profile_settings_color_mode_check;

alter table public.profile_settings
  alter column color_mode drop default,
  alter column color_mode type public.color_mode_preference
    using color_mode::public.color_mode_preference,
  alter column color_mode set default 'system'::public.color_mode_preference;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'name'
  ) then
    alter table public.profiles rename column name to username;
  end if;
end;
$$;

with normalized as (
  select
    profile.id,
    case
      when char_length(stripped_value) = 0 then 'user'
      when char_length(stripped_value) < 3 then rpad(stripped_value, 3, '0')
      else left(stripped_value, 30)
    end as normalized_username
  from (
    select
      id,
      regexp_replace(lower(coalesce(username, '')), '[^a-z0-9]', '', 'g') as stripped_value
    from public.profiles
  ) profile
)
update public.profiles profile
set username = normalized.normalized_username
from normalized
where profile.id = normalized.id;

alter table public.profiles
  alter column username set not null;

alter table public.profiles
  drop constraint if exists profiles_username_format_check,
  drop constraint if exists profiles_username_length_check;

alter table public.profiles
  add constraint profiles_username_format_check
    check (username ~ '^[a-z0-9]+$'),
  add constraint profiles_username_length_check
    check (char_length(username) >= 3 and char_length(username) <= 30);

drop trigger if exists on_auth_user_email_updated on auth.users;
drop function if exists public.sync_profile_email_from_auth_user();

alter table public.profiles
  drop column if exists email;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_username text;
begin
  new_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'user'
  );

  new_username := regexp_replace(lower(new_username), '[^a-z0-9]', '', 'g');

  if char_length(new_username) = 0 then
    new_username := 'user';
  end if;

  if char_length(new_username) < 3 then
    new_username := rpad(new_username, 3, '0');
  end if;

  new_username := left(new_username, 30);

  insert into public.profiles (id, username)
  values (new.id, new_username)
  on conflict (id) do update
    set username = excluded.username;

  return new;
end;
$$;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;

create policy "Profiles are viewable by owner" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "Profiles are insertable by owner" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Profiles are updatable by owner" on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "settings_select_own" on public.profile_settings;
drop policy if exists "settings_insert_own" on public.profile_settings;
drop policy if exists "settings_update_own" on public.profile_settings;

create policy "settings_select_own" on public.profile_settings
  for select using ((select auth.uid()) = id);

create policy "settings_insert_own" on public.profile_settings
  for insert with check ((select auth.uid()) = id);

create policy "settings_update_own" on public.profile_settings
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
