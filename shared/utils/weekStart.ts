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
 * Format date to ISO date string (YYYY-MM-DD).
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO date string (YYYY-MM-DD) to a Date object.
 */
export function parseISODateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

/**
 * Get day labels for the contribution graph based on week start.
 * Returns labels for positions 2, 4, 6 (Tue, Thu, Sat or relative equivalents).
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
 */
export function toCalendarWeekStart(
  weekStart: WeekStartDay,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return toJsWeekStart(weekStart);
}
