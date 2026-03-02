DROP POLICY IF EXISTS "completions_select_own" ON public.completions;
DROP POLICY IF EXISTS "completions_insert_own" ON public.completions;
DROP POLICY IF EXISTS "completions_update_own" ON public.completions;
DROP POLICY IF EXISTS "completions_delete_own" ON public.completions;

ALTER TABLE public.completions DROP COLUMN user_id;

ALTER TABLE public.completions DROP CONSTRAINT IF EXISTS completions_unique_habit_year;
ALTER TABLE public.completions ADD PRIMARY KEY (habit_id, year);

CREATE POLICY "completions_select_own" ON public.completions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = completions.habit_id AND habits.user_id = auth.uid())
  );

CREATE POLICY "completions_insert_own" ON public.completions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = completions.habit_id AND habits.user_id = auth.uid())
  );

CREATE POLICY "completions_update_own" ON public.completions
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = completions.habit_id AND habits.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = completions.habit_id AND habits.user_id = auth.uid())
  );

CREATE POLICY "completions_delete_own" ON public.completions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = completions.habit_id AND habits.user_id = auth.uid())
  );

DROP FUNCTION IF EXISTS public.set_habit_completion(uuid, uuid, date, integer);

CREATE OR REPLACE FUNCTION public.set_habit_completion(
  p_habit_id uuid,
  p_date date,
  p_value integer,
  p_week_start integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_year int := extract(year FROM p_date)::int;
  bit_index int := extract(doy FROM p_date)::int - 1;
  zero_bitmap bytea := decode(repeat('00', 46), 'hex');
  zero_wc bytea := decode(repeat('00', 53), 'hex');
  zero_mc bytea := decode(repeat('00', 12), 'hex');
  month_idx int := extract(month FROM p_date)::int - 1;
  week_idx int;
  jan1_iso_dow int;
  jan1_offset int;
  doy int := extract(doy FROM p_date)::int;
  old_bit int;
  cur_wc int;
  cur_mc int;
BEGIN

  jan1_iso_dow := (extract(dow FROM make_date(target_year, 1, 1))::int + 6) % 7;
  jan1_offset := (jan1_iso_dow - p_week_start + 7) % 7;
  week_idx := ((doy - 1) + jan1_offset) / 7;
  IF week_idx > 52 THEN week_idx := 52; END IF;

  INSERT INTO public.completions (habit_id, year, bitmap, week_counts, month_counts, updated_at)
  VALUES (p_habit_id, target_year, zero_bitmap, zero_wc, zero_mc, now())
  ON CONFLICT (habit_id, year) DO NOTHING;

  SELECT get_bit(bitmap, bit_index) INTO old_bit
  FROM public.completions
  WHERE habit_id = p_habit_id AND year = target_year;

  IF old_bit IS DISTINCT FROM p_value THEN

    SELECT get_byte(week_counts, week_idx), get_byte(month_counts, month_idx)
    INTO cur_wc, cur_mc
    FROM public.completions
    WHERE habit_id = p_habit_id AND year = target_year;

    UPDATE public.completions
    SET bitmap = set_bit(bitmap, bit_index, p_value),
        week_counts = set_byte(week_counts, week_idx, GREATEST(0, LEAST(255,
          CASE WHEN p_value = 1 THEN cur_wc + 1 ELSE cur_wc - 1 END
        ))),
        month_counts = set_byte(month_counts, month_idx, GREATEST(0, LEAST(255,
          CASE WHEN p_value = 1 THEN cur_mc + 1 ELSE cur_mc - 1 END
        ))),
        updated_at = now()
    WHERE habit_id = p_habit_id
      AND year = target_year;
  END IF;
END;
$function$;
