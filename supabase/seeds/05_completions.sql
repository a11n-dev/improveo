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
  v_week_start int := 0; -- Monday (ISO 8601)
begin
  select id into member1_id from auth.users where email = 'member1@example.test';
  select id into member2_id from auth.users where email = 'member2@example.test';

  if member1_id is null or member2_id is null then
    raise notice 'Skipping completion bitmap seed because test users do not exist';
    return;
  end if;

  -- Member #1: active daily streak.
  perform public.set_habit_completion('22222222-2222-4222-8222-222222222222'::uuid, (current_date - 2), 1, v_week_start);
  perform public.set_habit_completion('22222222-2222-4222-8222-222222222222'::uuid, (current_date - 1), 1, v_week_start);
  perform public.set_habit_completion('22222222-2222-4222-8222-222222222222'::uuid, current_date, 1, v_week_start);

  -- Member #1: broken daily streak.
  perform public.set_habit_completion('33333333-3333-4333-8333-333333333333'::uuid, (current_date - 8), 1, v_week_start);
  perform public.set_habit_completion('33333333-3333-4333-8333-333333333333'::uuid, (current_date - 7), 1, v_week_start);

  -- Member #1: weekly target examples.
  perform public.set_habit_completion('44444444-4444-4444-8444-444444444444'::uuid, (current_date - 12), 1, v_week_start);
  perform public.set_habit_completion('44444444-4444-4444-8444-444444444444'::uuid, (current_date - 10), 1, v_week_start);
  perform public.set_habit_completion('44444444-4444-4444-8444-444444444444'::uuid, (current_date - 8), 1, v_week_start);
  perform public.set_habit_completion('44444444-4444-4444-8444-444444444444'::uuid, (current_date - 5), 1, v_week_start);
  perform public.set_habit_completion('44444444-4444-4444-8444-444444444444'::uuid, (current_date - 3), 1, v_week_start);
  perform public.set_habit_completion('44444444-4444-4444-8444-444444444444'::uuid, (current_date - 1), 1, v_week_start);

  -- Member #1: monthly target examples.
  perform public.set_habit_completion('55555555-5555-4555-8555-555555555555'::uuid, (current_date - 50), 1, v_week_start);
  perform public.set_habit_completion('55555555-5555-4555-8555-555555555555'::uuid, (current_date - 40), 1, v_week_start);
  perform public.set_habit_completion('55555555-5555-4555-8555-555555555555'::uuid, (current_date - 10), 1, v_week_start);
  perform public.set_habit_completion('55555555-5555-4555-8555-555555555555'::uuid, (current_date - 1), 1, v_week_start);

  -- Member #1: no-goal mode still has completion history.
  perform public.set_habit_completion('66666666-6666-4666-8666-666666666666'::uuid, (current_date - 4), 1, v_week_start);

  -- Member #2: isolated data for access checks.
  perform public.set_habit_completion('77777777-7777-4777-8777-777777777777'::uuid, (current_date - 2), 1, v_week_start);
end
$$;
