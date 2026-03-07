-- Habit fixtures for deterministic local and CI tests.

with member1 as (
  select id as user_id
  from auth.users
  where email = 'member1@example.test'
)
insert into public.habits (
  id,
  user_id,
  "order",
  title,
  description,
  icon,
  color
)
select
  habit.id,
  member1.user_id,
  habit.habit_order,
  habit.title,
  habit.description,
  habit.icon,
  habit.color
from member1
cross join (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid, 0, 'Read 20 pages', 'No completions yet', 'i-lucide-book-open', '#3B82F6'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 1, 'Morning walk', 'Active daily streak', 'i-lucide-footprints', '#10B981'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 2, 'Meditation', 'Broken daily streak', 'i-lucide-flower-2', '#F59E0B'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 3, 'Workout sessions', 'Weekly habit (3x)', 'i-lucide-dumbbell', '#EF4444'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 4, 'Deep work blocks', 'Monthly habit (8x)', 'i-lucide-brain', '#8B5CF6'),
    ('66666666-6666-4666-8666-666666666666'::uuid, 5, 'Journal notes', 'No goal tracking', 'i-lucide-notebook-pen', '#06B6D4')
) as habit(id, habit_order, title, description, icon, color)
on conflict (id) do update
set
  user_id = excluded.user_id,
  "order" = excluded."order",
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  updated_at = now();

with member2 as (
  select id as user_id
  from auth.users
  where email = 'member2@example.test'
)
insert into public.habits (
  id,
  user_id,
  "order",
  title,
  description,
  icon,
  color
)
select
  '77777777-7777-4777-8777-777777777777'::uuid,
  member2.user_id,
  0,
  'Practice guitar',
  'Secondary user habit for ownership checks',
  'i-lucide-music-4',
  '#14B8A6'
from member2
on conflict (id) do update
set
  user_id = excluded.user_id,
  "order" = excluded."order",
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  updated_at = now();
