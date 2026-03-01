-- Migration: add reduce_animations setting to profile_settings
-- Stores a user preference for reduced UI motion.

alter table if exists public.profile_settings
add column if not exists reduce_animations boolean not null default false;

comment on column public.profile_settings.reduce_animations is
  'When true, reduced-motion animations are preferred across the UI.';
