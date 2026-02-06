-- Migration: Convert week_start from JS standard (0=Sunday) to ISO 8601 (0=Monday)
-- Backup reminder: This remaps existing data irreversibly

-- Step 1: Remap existing values
-- Old: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- New: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
UPDATE profiles 
SET week_start = CASE week_start
  WHEN 0 THEN 6  -- Sunday → Saturday (new 6)
  WHEN 1 THEN 0  -- Monday → Monday (new 0) 
  WHEN 2 THEN 1  -- Tuesday → Tuesday (new 1)
  WHEN 3 THEN 2  -- Wednesday → Wednesday (new 2)
  WHEN 4 THEN 3  -- Thursday → Thursday (new 3)
  WHEN 5 THEN 4  -- Friday → Friday (new 4)
  WHEN 6 THEN 5  -- Saturday → Sunday (new 5)
  ELSE 0         -- Default to Monday for any unexpected values
END;

-- Step 2: Update default constraint to Monday (0 in new system)
ALTER TABLE profiles ALTER COLUMN week_start SET DEFAULT 0;

-- Step 3: Verify the migration
-- Should show: 0=Monday as the most common value now
SELECT week_start, COUNT(*) as count 
FROM profiles 
GROUP BY week_start 
ORDER BY week_start;;
