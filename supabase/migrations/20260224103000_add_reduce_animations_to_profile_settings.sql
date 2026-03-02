alter table if exists public.profile_settings
add column if not exists reduce_animations boolean not null default false;

comment on column public.profile_settings.reduce_animations is
  'When true, reduced-motion animations are preferred across the UI.';
