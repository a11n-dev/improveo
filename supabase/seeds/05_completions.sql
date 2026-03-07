-- Completion fixtures and bitmap population for habit scenarios.

delete from public.completions
where habit_id in (
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,
  '44444444-4444-4444-8444-444444444444'::uuid,
  '55555555-5555-4555-8555-555555555555'::uuid,
  '66666666-6666-4666-8666-666666666666'::uuid,
  '77777777-7777-4777-8777-777777777777'::uuid
);

do $$
declare
  member1_id uuid;
  member2_id uuid;
  completion_seed record;
begin
  select id into member1_id from auth.users where email = 'member1@example.test';
  select id into member2_id from auth.users where email = 'member2@example.test';

  if member1_id is null or member2_id is null then
    raise notice 'Skipping completion bitmap seed because test users do not exist';
    return;
  end if;

  for completion_seed in
    select *
    from (
      values
        ('22222222-2222-4222-8222-222222222222'::uuid, current_date - 2),
        ('22222222-2222-4222-8222-222222222222'::uuid, current_date - 1),
        ('22222222-2222-4222-8222-222222222222'::uuid, current_date),
        ('33333333-3333-4333-8333-333333333333'::uuid, current_date - 8),
        ('33333333-3333-4333-8333-333333333333'::uuid, current_date - 7),
        ('44444444-4444-4444-8444-444444444444'::uuid, current_date - 12),
        ('44444444-4444-4444-8444-444444444444'::uuid, current_date - 10),
        ('44444444-4444-4444-8444-444444444444'::uuid, current_date - 8),
        ('44444444-4444-4444-8444-444444444444'::uuid, current_date - 5),
        ('44444444-4444-4444-8444-444444444444'::uuid, current_date - 3),
        ('44444444-4444-4444-8444-444444444444'::uuid, current_date - 1),
        ('55555555-5555-4555-8555-555555555555'::uuid, current_date - 50),
        ('55555555-5555-4555-8555-555555555555'::uuid, current_date - 40),
        ('55555555-5555-4555-8555-555555555555'::uuid, current_date - 10),
        ('55555555-5555-4555-8555-555555555555'::uuid, current_date - 1),
        ('66666666-6666-4666-8666-666666666666'::uuid, current_date - 4),
        ('77777777-7777-4777-8777-777777777777'::uuid, current_date - 2)
    ) as completion_seed(habit_id, completed_on)
  loop
    insert into public.completions (habit_id, year, bitmap, updated_at)
    values (
      completion_seed.habit_id,
      extract(year from completion_seed.completed_on)::int,
      set_bit(
        repeat('0', 366)::bit(366),
        extract(doy from completion_seed.completed_on)::int - 1,
        1
      ),
      now()
    )
    on conflict (habit_id, year) do update
    set
      bitmap = public.completions.bitmap | excluded.bitmap,
      updated_at = now();
  end loop;
end
$$;
