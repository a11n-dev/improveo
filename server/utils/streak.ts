/**
 * Server-side streak calculation logic.
 * Recomputes streak information based on all completions for a habit.
 */

import type { StreakInterval, WeekStartDay } from "~~/shared/types/habit";
import {
  getWeekKey,
  getMonthKey,
  parseISODateString,
  toISODateString,
} from "~~/shared/utils/weekStart";

interface CompletionRecord {
  completed_on: string; // YYYY-MM-DD
}

interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  lastCompletedOn: string | null;
}

interface HabitStreakConfig {
  streakInterval: StreakInterval | null;
  streakCount: number;
}

/**
 * Group completion dates by interval.
 * Returns a map of interval key -> completion count.
 */
function groupCompletionsByInterval(
  completions: CompletionRecord[],
  interval: StreakInterval | null,
  weekStart: WeekStartDay,
): Map<string, number> {
  const groups = new Map<string, number>();

  // No grouping needed for null interval (no streak tracking)
  if (interval === null) {
    return groups;
  }

  for (const completion of completions) {
    const date = parseISODateString(completion.completed_on);
    let key: string;

    switch (interval) {
      case "daily":
        key = completion.completed_on;
        break;
      case "weekly":
        key = getWeekKey(date, weekStart);
        break;
      case "monthly":
        key = getMonthKey(date);
        break;
      default:
        // Should never happen, but TypeScript needs this
        continue;
    }

    groups.set(key, (groups.get(key) || 0) + 1);
  }

  return groups;
}

/**
 * Get all interval keys in sorted order for a range.
 * For daily: all dates
 * For weekly: all week keys
 * For monthly: all month keys
 */
function getIntervalKeysInOrder(
  groups: Map<string, number>,
  interval: StreakInterval | null,
): string[] {
  const keys = Array.from(groups.keys());

  // Sort keys chronologically
  keys.sort((a, b) => {
    if (interval === "daily") {
      return a.localeCompare(b);
    }
    // For weekly and monthly, format is YYYY-WW or YYYY-MM
    return a.localeCompare(b);
  });

  return keys;
}

/**
 * Check if two interval keys are consecutive.
 */
function areConsecutiveIntervals(
  prev: string,
  curr: string,
  interval: StreakInterval | null,
): boolean {
  switch (interval) {
    case "daily": {
      const prevDate = parseISODateString(prev);
      const currDate = parseISODateString(curr);
      const diffDays =
        (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);
      return Math.round(diffDays) === 1;
    }
    case "weekly": {
      // Weekly keys are YYYY-WW format
      const [prevYear, prevWeek] = prev.split("-").map(Number);
      const [currYear, currWeek] = curr.split("-").map(Number);

      if (currYear === prevYear) {
        return currWeek! - prevWeek! === 1;
      }
      // Handle year boundary - last week of prev year to first week of curr year
      if (currYear === prevYear! + 1 && currWeek === 1) {
        // This is approximate - could be consecutive if prevWeek is the last week
        // We'll consider weeks 52 and 53 as potentially the last week
        return prevWeek! >= 52;
      }
      return false;
    }
    case "monthly": {
      // Monthly keys are YYYY-MM format
      const [prevYear, prevMonth] = prev.split("-").map(Number);
      const [currYear, currMonth] = curr.split("-").map(Number);

      if (currYear === prevYear) {
        return currMonth! - prevMonth! === 1;
      }
      // Handle year boundary
      if (currYear === prevYear! + 1 && currMonth === 1 && prevMonth === 12) {
        return true;
      }
      return false;
    }
    case null:
    default:
      return false;
  }
}

/**
 * Compute streak statistics from completions.
 *
 * Algorithm:
 * 1. Group completions by interval (daily/weekly/monthly)
 * 2. An interval is "complete" if count >= streak_count
 * 3. Find consecutive completed intervals for current and best streak
 */
export function computeStreaks(
  completions: CompletionRecord[],
  config: HabitStreakConfig,
  weekStart: WeekStartDay,
): StreakResult {
  // Find last completed date (even for 'none' interval)
  const sortedCompletions = [...completions].sort((a, b) =>
    b.completed_on.localeCompare(a.completed_on),
  );
  const lastCompletedOn =
    sortedCompletions.length > 0 ? sortedCompletions[0]!.completed_on : null;

  // For null interval, no streak tracking
  if (config.streakInterval === null) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedOn,
    };
  }

  if (completions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedOn: null,
    };
  }

  // Group by interval
  const groups = groupCompletionsByInterval(
    completions,
    config.streakInterval,
    weekStart,
  );

  // Filter to only completed intervals (count >= streak_count)
  const completedIntervals = new Map<string, number>();
  for (const [key, count] of groups) {
    if (count >= config.streakCount) {
      completedIntervals.set(key, count);
    }
  }

  if (completedIntervals.size === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedOn,
    };
  }

  // Get sorted interval keys
  const keys = getIntervalKeysInOrder(
    completedIntervals,
    config.streakInterval,
  );

  // Calculate streaks
  let bestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < keys.length; i++) {
    if (
      areConsecutiveIntervals(keys[i - 1]!, keys[i]!, config.streakInterval)
    ) {
      currentRun++;
      bestStreak = Math.max(bestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Calculate current streak (consecutive from the latest completed interval)
  // We need to check if the latest completed interval is recent enough
  let currentStreak = 0;
  if (keys.length > 0) {
    const latestKey = keys[keys.length - 1]!;
    const now = new Date();
    let currentIntervalKey: string;

    switch (config.streakInterval) {
      case "daily":
        currentIntervalKey = toISODateString(now);
        break;
      case "weekly":
        currentIntervalKey = getWeekKey(now, weekStart);
        break;
      case "monthly":
        currentIntervalKey = getMonthKey(now);
        break;
      default:
        // null is already handled above, but TypeScript needs this
        currentIntervalKey = "";
    }

    // Check if the latest completed interval is current or the one before
    const isLatestCurrent = latestKey === currentIntervalKey;
    const isLatestPrevious = areConsecutiveIntervals(
      latestKey,
      currentIntervalKey,
      config.streakInterval,
    );

    if (isLatestCurrent || isLatestPrevious) {
      // Count backwards from the latest key
      currentStreak = 1;
      for (let i = keys.length - 2; i >= 0; i--) {
        if (
          areConsecutiveIntervals(keys[i]!, keys[i + 1]!, config.streakInterval)
        ) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    currentStreak,
    bestStreak,
    lastCompletedOn,
  };
}
