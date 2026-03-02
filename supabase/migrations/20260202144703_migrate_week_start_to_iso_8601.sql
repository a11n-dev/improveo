UPDATE profiles
SET week_start = CASE week_start
  WHEN 0 THEN 6
  WHEN 1 THEN 0
  WHEN 2 THEN 1
  WHEN 3 THEN 2
  WHEN 4 THEN 3
  WHEN 5 THEN 4
  WHEN 6 THEN 5
  ELSE 0
END;

ALTER TABLE profiles ALTER COLUMN week_start SET DEFAULT 0;

SELECT week_start, COUNT(*) as count
FROM profiles
GROUP BY week_start
ORDER BY week_start;
