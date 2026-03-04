alter table public.profiles
  add constraint profiles_username_unique unique (username);

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

  begin
    insert into public.profiles (id, username)
    values (new.id, new_username)
    on conflict (id) do update
      set username = excluded.username;
  exception
    when unique_violation then
      raise exception using
        errcode = '23505',
        message = 'Username is already taken';
  end;

  return new;
end;
$$;
