import type { CompletionBitmapRow, HabitStreak } from "~~/server/types/habit";
import {
  decodeBitmapToCompletionDates,
  parsePackedCounts,
} from "~~/server/utils/completions";
import { parseISODateString, toISODateString } from "~~/shared/utils/weekStart";

/**
 * Server-side streak calculation logic.
 * Computes streak information from packed counters (week_counts / month_counts)
 * or bitmap (for daily goals).
 */

interface GoalConfig {
  periodType: PeriodType;
  targetCount: number;
}

/**
 * Compute streak statistics from packed counters and/or bitmaps.
 *
 * For daily goals: scans bitmap day-by-day checking consecutive completed days.
 * For weekly goals: scans week_counts checking consecutive weeks meeting targetCount.
 * For monthly goals: scans month_counts checking consecutive months meeting targetCount.
 *
 * Rows must be sorted by year ascending.
 */
export function computeStreaks(
  rows: CompletionBitmapRow[],
  config: GoalConfig,
  weekStart: WeekStartDay,
): HabitStreak {
  if (rows.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Sort rows by year ascending
  const sortedRows = [...rows].sort((a, b) => a.year - b.year);

  switch (config.periodType) {
    case "day":
      return computeDailyStreaks(sortedRows);
    case "week":
      return computePeriodicStreaks(
        sortedRows,
        config.targetCount,
        "week_counts",
        53,
        weekStart,
      );
    case "month":
      return computePeriodicStreaks(
        sortedRows,
        config.targetCount,
        "month_counts",
        12,
        weekStart,
      );
    default:
      return { currentStreak: 0, bestStreak: 0 };
  }
}

/**
 * Compute daily streaks by scanning bitmaps.
 * A daily goal always has targetCount=1, so any completed day counts.
 */
function computeDailyStreaks(rows: CompletionBitmapRow[]): HabitStreak {
  // Build a flat array of all completed dates across all years
  const allDates: string[] = [];
  for (const row of rows) {
    const dates = decodeBitmapToCompletionDates(row.bitmap, row.year);
    allDates.push(...dates);
  }

  if (allDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Sort dates chronologically
  allDates.sort();

  let bestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < allDates.length; i++) {
    const prevDate = parseISODateString(allDates[i - 1]!);
    const currDate = parseISODateString(allDates[i]!);
    const diffMs = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > bestStreak) bestStreak = currentRun;
    } else if (diffDays > 1) {
      currentRun = 1;
    }
    // diffDays === 0 means duplicate date, skip
  }

  // Check if current streak is active (latest date is today or yesterday)
  const latestDate = allDates[allDates.length - 1]!;
  const today = toISODateString(new Date());
  const yesterday = toISODateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

  let currentStreak = 0;
  if (latestDate === today || latestDate === yesterday) {
    // Count backwards from the end
    currentStreak = 1;
    for (let i = allDates.length - 2; i >= 0; i--) {
      const prev = parseISODateString(allDates[i]!);
      const curr = parseISODateString(allDates[i + 1]!);
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break;
      }
    }
  }

  return { currentStreak, bestStreak };
}

/**
 * Compute periodic (weekly/monthly) streaks from packed counters.
 * Scans counter arrays across years, checking consecutive periods meeting targetCount.
 */
function computePeriodicStreaks(
  rows: CompletionBitmapRow[],
  targetCount: number,
  countField: "week_counts" | "month_counts",
  periodsPerYear: number,
  _weekStart: WeekStartDay,
): HabitStreak {
  // Build a flat list of (year, periodIndex, met) tuples
  const allPeriods: { year: number; index: number; met: boolean }[] = [];

  for (const row of rows) {
    const counts = parsePackedCounts(row[countField]);
    for (let i = 0; i < Math.min(counts.length, periodsPerYear); i++) {
      allPeriods.push({
        year: row.year,
        index: i,
        met: (counts[i] ?? 0) >= targetCount,
      });
    }
  }

  if (allPeriods.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Calculate best streak and current streak
  let bestStreak = 0;
  let currentRun = 0;

  for (const period of allPeriods) {
    if (period.met) {
      currentRun++;
      if (currentRun > bestStreak) bestStreak = currentRun;
    } else {
      currentRun = 0;
    }
  }

  // Determine current streak: the trailing consecutive met periods
  // Only count if the latest met period is current or immediately previous
  let currentStreak = 0;
  const now = new Date();
  const currentYear = now.getFullYear();

  let currentPeriodIndex: number;
  if (countField === "week_counts") {
    // Approximate current week index
    const startOfYear = new Date(currentYear, 0, 1);
    const diffMs = now.getTime() - startOfYear.getTime();
    currentPeriodIndex = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  } else {
    currentPeriodIndex = now.getMonth();
  }

  // Walk backwards from the end of allPeriods
  let foundActive = false;
  for (let i = allPeriods.length - 1; i >= 0; i--) {
    const period = allPeriods[i]!;
    if (!foundActive) {
      // Skip trailing unmet periods, but only if they're in the future or current
      if (!period.met) {
        // Check if this is the current or future period (haven't finished yet)
        if (
          period.year > currentYear ||
          (period.year === currentYear && period.index >= currentPeriodIndex)
        ) {
          continue;
        }
        // Past unmet period — no current streak
        break;
      }
      foundActive = true;
      currentStreak = 1;
    } else {
      if (period.met) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, bestStreak };
}
