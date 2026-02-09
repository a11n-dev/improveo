-- Goal version fixtures matching habit seed data.
-- Maps old streak_interval/streak_count to new habit_goal_versions rows.

delete from public.habit_goal_versions
where habit_id in (
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,
  '44444444-4444-4444-8444-444444444444'::uuid,
  '55555555-5555-4555-8555-555555555555'::uuid,
  '66666666-6666-4666-8666-666666666666'::uuid,
  '77777777-7777-4777-8777-777777777777'::uuid
);

-- Habit 1: Read 20 pages — daily goal (1x/day)
insert into public.habit_goal_versions (habit_id, period_type, target_count, effective_from, effective_to)
values ('11111111-1111-4111-8111-111111111111'::uuid, 'day', 1, '2025-01-01', null);

-- Habit 2: Morning walk — daily goal (1x/day)
insert into public.habit_goal_versions (habit_id, period_type, target_count, effective_from, effective_to)
values ('22222222-2222-4222-8222-222222222222'::uuid, 'day', 1, '2025-01-01', null);

-- Habit 3: Meditation — daily goal (1x/day)
insert into public.habit_goal_versions (habit_id, period_type, target_count, effective_from, effective_to)
values ('33333333-3333-4333-8333-333333333333'::uuid, 'day', 1, '2025-01-01', null);

-- Habit 4: Workout sessions — weekly goal (3x/week)
insert into public.habit_goal_versions (habit_id, period_type, target_count, effective_from, effective_to)
values ('44444444-4444-4444-8444-444444444444'::uuid, 'week', 3, '2025-01-01', null);

-- Habit 5: Deep work blocks — monthly goal (8x/month)
insert into public.habit_goal_versions (habit_id, period_type, target_count, effective_from, effective_to)
values ('55555555-5555-4555-8555-555555555555'::uuid, 'month', 8, '2025-01-01', null);

-- Habit 6: Journal notes — no goal tracking (no row inserted)

-- Habit 7: Practice guitar (member2) — daily goal (1x/day)
insert into public.habit_goal_versions (habit_id, period_type, target_count, effective_from, effective_to)
values ('77777777-7777-4777-8777-777777777777'::uuid, 'day', 1, '2025-01-01', null);
