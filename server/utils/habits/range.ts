import type { HabitRange } from "~~/server/types/habit";
import { parseISODateString, toISODateString } from "~~/shared/utils/weekStart";

/**
 * Returns the default habits API date range.
 * The window includes today and the previous 364 days.
 */
export const buildDefaultRange = (endDate = new Date()): HabitRange => {
  const toDate = new Date(endDate);
  const fromDate = new Date(endDate);
  fromDate.setDate(fromDate.getDate() - 364);

  return {
    fromStr: toISODateString(fromDate),
    toStr: toISODateString(toDate),
  };
};

/**
 * Backward-compatible alias for existing consumers.
 */
export const getDefaultHabitRange = buildDefaultRange;

/**
 * Resolves an explicit date range from query params with safe defaults.
 */
export const getHabitRangeFromQuery = (
  query: Record<string, unknown>,
): HabitRange => {
  const defaults = buildDefaultRange();

  return {
    fromStr: typeof query.from === "string" ? query.from : defaults.fromStr,
    toStr: typeof query.to === "string" ? query.to : defaults.toStr,
  };
};

/**
 * Returns all calendar years covered by an inclusive date range.
 */
export const getYearsInRange = (fromStr: string, toStr: string): number[] => {
  const fromDate = parseISODateString(fromStr);
  const toDate = parseISODateString(toStr);
  const years: number[] = [];

  for (
    let year = fromDate.getFullYear();
    year <= toDate.getFullYear();
    year++
  ) {
    years.push(year);
  }

  return years;
};
