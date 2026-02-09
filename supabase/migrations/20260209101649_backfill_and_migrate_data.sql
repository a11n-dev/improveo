-- 1) Migrate existing goal fields from habits into habit_goal_versions
INSERT INTO public.habit_goal_versions (habit_id, period_type, target_count, effective_from, effective_to)
SELECT
  h.id,
  CASE h.streak_interval
    WHEN 'daily' THEN 'day'
    WHEN 'weekly' THEN 'week'
    WHEN 'monthly' THEN 'month'
  END,
  h.streak_count,
  COALESCE(h.created_at::date, CURRENT_DATE),
  NULL
FROM public.habits h
WHERE h.streak_interval IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.habit_goal_versions gv WHERE gv.habit_id = h.id
  );

-- 2) Backfill week_counts and month_counts from existing bitmaps
DO $$
DECLARE
  rec RECORD;
  bm bytea;
  byte_idx int;
  bit_idx int;
  bit_val int;
  day_of_year int;
  cur_date date;
  week_idx int;
  month_idx int;
  wc int[];
  mc int[];
  ws int;  -- week_start for user (0=Mon ISO)
  js_dow int;  -- JS-style day of week (0=Sun)
  iso_dow int; -- 0=Mon based
  week_start_offset int;
  days_in_year int;
  yr int;
BEGIN
  FOR rec IN
    SELECT c.habit_id, c.year, c.bitmap, c.user_id
    FROM public.completions c
    WHERE c.bitmap IS NOT NULL
  LOOP
    bm := rec.bitmap;
    yr := rec.year;

    -- Get week_start from user profile
    SELECT COALESCE(p.week_start, 0) INTO ws
    FROM public.profiles p
    JOIN public.habits h ON h.user_id = p.id
    WHERE h.id = rec.habit_id
    LIMIT 1;

    -- Determine days in year
    IF (yr % 4 = 0 AND (yr % 100 != 0 OR yr % 400 = 0)) THEN
      days_in_year := 366;
    ELSE
      days_in_year := 365;
    END IF;

    -- Initialize counters
    wc := array_fill(0, ARRAY[53]);
    mc := array_fill(0, ARRAY[12]);

    -- Iterate each day of the year
    FOR day_of_year IN 1..days_in_year LOOP
      -- Check if bit is set (bit index = day_of_year - 1)
      bit_val := get_bit(bm, day_of_year - 1);
      IF bit_val = 1 THEN
        cur_date := make_date(yr, 1, 1) + (day_of_year - 1);

        -- Month index (0-based)
        month_idx := EXTRACT(MONTH FROM cur_date)::int - 1;
        mc[month_idx + 1] := mc[month_idx + 1] + 1;

        -- Week index: compute based on user's week_start
        -- ws is ISO 8601: 0=Mon, 1=Tue, ..., 6=Sun
        -- PostgreSQL EXTRACT(DOW) returns 0=Sun, 1=Mon, ..., 6=Sat
        -- Convert pg DOW to ISO-based (0=Mon): (DOW + 6) % 7
        iso_dow := (EXTRACT(DOW FROM cur_date)::int + 6) % 7;
        -- Day index within user's week: (iso_dow - ws + 7) % 7
        -- Day of year offset for week calculation
        -- Compute week index as: floor((day_of_year - 1 + offset) / 7)
        -- where offset accounts for what day Jan 1 falls on relative to week_start
        DECLARE
          jan1_iso_dow int;
          jan1_offset int;
        BEGIN
          jan1_iso_dow := (EXTRACT(DOW FROM make_date(yr, 1, 1))::int + 6) % 7;
          jan1_offset := (jan1_iso_dow - ws + 7) % 7;
          week_idx := ((day_of_year - 1) + jan1_offset) / 7;
          IF week_idx > 52 THEN week_idx := 52; END IF;
          wc[week_idx + 1] := wc[week_idx + 1] + 1;
        END;
      END IF;
    END LOOP;

    -- Pack week_counts (53 bytes)
    DECLARE
      wc_bytes bytea := decode(repeat('00', 53), 'hex');
      mc_bytes bytea := decode(repeat('00', 12), 'hex');
      i int;
    BEGIN
      FOR i IN 1..53 LOOP
        wc_bytes := set_byte(wc_bytes, i - 1, LEAST(wc[i], 255));
      END LOOP;
      FOR i IN 1..12 LOOP
        mc_bytes := set_byte(mc_bytes, i - 1, LEAST(mc[i], 255));
      END LOOP;

      UPDATE public.completions
      SET week_counts = wc_bytes,
          month_counts = mc_bytes
      WHERE habit_id = rec.habit_id
        AND year = yr;
    END;
  END LOOP;
END $$;
