/**
 * Shared week start handling utilities.
 * Used by both client (calendar/graph) and server (streak calculations).
 */

import type { WeekStartDay } from "../types/habit";

/**
 * Convert ISO week start (Mon=0..Sun=6) to JS Date.getDay() index (Sun=0..Sat=6).
 */
export function toJsWeekStart(
  weekStart: WeekStartDay,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return ((weekStart + 1) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Get the day of week index (0-6) based on week start preference.
 * Returns position within the week (0 = first day of week, 6 = last day).
 *
 * @param date - The date to get the day index for
 * @param weekStart - Week start day (0 = Monday, 1 = Tuesday, ..., 6 = Sunday) - ISO 8601
 * @returns Day index within the week (0-6)
 */
export function getDayIndexForWeekStart(
  date: Date,
  weekStart: WeekStartDay,
): number {
  const jsDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const jsWeekStart = toJsWeekStart(weekStart);
  // Shift the day relative to week start
  return (jsDay - jsWeekStart + 7) % 7;
}

/**
 * Get the start of the week for a given date.
 *
 * @param date - The date to get the week start for
 * @param weekStart - Week start day (0 = Monday, 1 = Tuesday, ..., 6 = Sunday) - ISO 8601
 * @returns Date object set to the start of the week (00:00:00)
 */
export function getWeekStartDate(date: Date, weekStart: WeekStartDay): Date {
  const result = new Date(date);
  const dayIndex = getDayIndexForWeekStart(date, weekStart);
  result.setDate(result.getDate() - dayIndex);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the week for a given date.
 *
 * @param date - The date to get the week end for
 * @param weekStart - Week start day (0 = Monday, 1 = Tuesday, ..., 6 = Sunday) - ISO 8601
 * @returns Date object set to the end of the week (23:59:59.999)
 */
export function getWeekEndDate(date: Date, weekStart: WeekStartDay): Date {
  const start = getWeekStartDate(date, weekStart);
  const result = new Date(start);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get a unique week key for a date (for grouping).
 * Format: YYYY-WW where WW is calculated based on weekStart.
 *
 * @param date - The date to get the week key for
 * @param weekStart - Week start day (0 = Monday, 1 = Tuesday, ..., 6 = Sunday) - ISO 8601
 * @returns Week key string (e.g., "2025-01" for first week of 2025)
 */
export function getWeekKey(date: Date, weekStart: WeekStartDay): string {
  const weekStartDate = getWeekStartDate(date, weekStart);
  const year = weekStartDate.getFullYear();

  // Calculate week number based on the start of the year
  const yearStart = new Date(year, 0, 1);
  const yearStartWeek = getWeekStartDate(yearStart, weekStart);

  // If year start is in the previous week, adjust to first complete week
  const firstWeekStart =
    yearStartWeek.getFullYear() < year
      ? new Date(yearStartWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      : yearStartWeek;

  const diffTime = weekStartDate.getTime() - firstWeekStart.getTime();
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  const weekNum = diffWeeks + 1;

  return `${year}-${String(weekNum).padStart(2, "0")}`;
}

/**
 * Get month key for a date (for grouping by month).
 * Format: YYYY-MM
 *
 * @param date - The date to get the month key for
 * @returns Month key string (e.g., "2025-01")
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Format date to ISO date string (YYYY-MM-DD).
 *
 * @param date - The date to format
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO date string (YYYY-MM-DD) to a Date object.
 *
 * @param dateStr - ISO date string
 * @returns Date object (at 00:00:00 local time)
 */
export function parseISODateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

/**
 * Get day labels for the contribution graph based on week start.
 * Returns labels for positions 2, 4, 6 (Tue, Thu, Sat or relative equivalents).
 *
 * @param weekStart - Week start day (0 = Monday, 1 = Tuesday, ..., 6 = Sunday) - ISO 8601
 * @returns Array of 7 labels (empty strings for unlabeled positions)
 */
export function getDayLabels(weekStart: WeekStartDay): string[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels: string[] = ["", "", "", "", "", "", ""];
  const jsWeekStart = toJsWeekStart(weekStart);

  // Fixed label positions: 1, 3, 5 (0-indexed: showing 2nd, 4th, 6th days)
  const labelPositions = [1, 3, 5];

  for (const pos of labelPositions) {
    // Calculate which actual day of week this position represents
    const actualDayIndex = (jsWeekStart + pos) % 7;
    labels[pos] = dayNames[actualDayIndex]!;
  }

  return labels;
}

/**
 * Convert ISO week start to the format used by date-fns and calendar components.
 * They use 0=Sunday convention.
 *
 * @param weekStart - Week start day from DB/DTO
 * @returns Week start for calendar components
 */
export function toCalendarWeekStart(
  weekStart: WeekStartDay,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return toJsWeekStart(weekStart);
}
