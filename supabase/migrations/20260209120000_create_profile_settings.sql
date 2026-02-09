-- =============================================================
-- Migration: create profile_settings table
-- Extracts settings (week_start, color_mode) from profiles
-- into a dedicated profile_settings table with RLS.
-- =============================================================

-- 1) Create profile_settings table
CREATE TABLE public.profile_settings (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  color_mode text NOT NULL DEFAULT 'system'
    CHECK (color_mode IN ('light', 'dark', 'system')),
  week_start smallint NOT NULL DEFAULT 0
    CHECK (week_start >= 0 AND week_start <= 6),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profile_settings IS 'User-level settings (color mode, week start). One row per profile.';

-- 2) Enable RLS
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies — owner-only SELECT, UPDATE
CREATE POLICY "settings_select_own" ON public.profile_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "settings_update_own" ON public.profile_settings
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow insert only for the owner (needed by trigger running as SECURITY DEFINER
-- and for manual backfill; runtime inserts go through trigger)
CREATE POLICY "settings_insert_own" ON public.profile_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4) Auto-update updated_at on profile_settings
DROP TRIGGER IF EXISTS set_profile_settings_updated_at ON public.profile_settings;
CREATE TRIGGER set_profile_settings_updated_at
  BEFORE UPDATE ON public.profile_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) Trigger: auto-create profile_settings row when a profile is inserted
CREATE OR REPLACE FUNCTION public.handle_new_profile_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_settings ON public.profiles;
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_settings();

-- 6) Backfill: migrate existing week_start data from profiles -> profile_settings
INSERT INTO public.profile_settings (id, week_start)
SELECT id, week_start FROM public.profiles
ON CONFLICT (id) DO UPDATE SET week_start = EXCLUDED.week_start;

-- 7) Drop week_start column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS week_start;
