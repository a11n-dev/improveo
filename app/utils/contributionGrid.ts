/**
 * Utility for building contribution graph grid data.
 * Generates days organized into weeks (7-row grid).
 */

export interface GridDay {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Whether this day is within the display range */
  inRange: boolean;
  /** Whether the habit was completed on this day */
  completed: boolean;
}

export interface ContributionGridOptions {
  /** End date of the range (defaults to today) */
  endDate?: Date;
  /** Number of days to display (defaults to 365) */
  daysCount?: number;
  /** Week start day (0 = Sunday, 1 = Monday, ..., 6 = Saturday) */
  weekStart: WeekStartDay;
  /** Completion map: date (YYYY-MM-DD) -> completed */
  completions: Record<string, boolean>;
}

/**
 * Get the day of week index (0-6) based on week start preference.
 * Returns position within the week (0 = first day of week).
 */
function getDayIndex(date: Date, weekStart: WeekStartDay): number {
  const jsDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return (jsDay - weekStart + 7) % 7;
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date (returns new Date).
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Build the contribution grid for a rolling date range.
 * Returns an array of weeks, where each week is an array of 7 GridDay objects.
 */
export function buildContributionGrid(
  options: ContributionGridOptions,
): GridDay[][] {
  const {
    endDate = new Date(),
    daysCount = 365,
    weekStart,
    completions,
  } = options;

  // Calculate range start (daysCount days before endDate)
  const rangeStart = addDays(endDate, -(daysCount - 1));
  const rangeEnd = endDate;

  // Find the first day of the grid (pad back to week start)
  const startDayIndex = getDayIndex(rangeStart, weekStart);
  const gridStart = addDays(rangeStart, -startDayIndex);

  // Find the last day of the grid (pad forward to end of week)
  const endDayIndex = getDayIndex(rangeEnd, weekStart);
  const daysToAdd = 6 - endDayIndex;
  const gridEnd = addDays(rangeEnd, daysToAdd);

  // Format range boundaries for comparison
  const rangeStartStr = formatDate(rangeStart);
  const rangeEndStr = formatDate(rangeEnd);

  // Build all days
  const days: GridDay[] = [];
  let current = gridStart;

  while (current <= gridEnd) {
    const dateStr = formatDate(current);
    const inRange = dateStr >= rangeStartStr && dateStr <= rangeEndStr;

    days.push({
      date: dateStr,
      inRange,
      completed: completions[dateStr] ?? false,
    });

    current = addDays(current, 1);
  }

  // Organize into weeks (each week = 7 days)
  const weeks: GridDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Get month labels with their starting column index.
 * Useful for rendering month headers above the grid.
 */
export function getMonthLabels(
  weeks: GridDay[][],
): { month: string; colIndex: number }[] {
  const labels: { month: string; colIndex: number }[] = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let lastMonthKey = "";

  weeks.forEach((week, colIndex) => {
    // Find the first in-range day in this week
    const inRangeDay = week.find((d) => d.inRange);
    if (inRangeDay) {
      const parts = inRangeDay.date.split("-");
      const yearStr = parts[0];
      const monthStr = parts[1];
      if (monthStr && yearStr) {
        const monthKey = `${yearStr}-${monthStr}`;
        if (monthKey !== lastMonthKey) {
          const month = parseInt(monthStr, 10) - 1;
          const monthName = monthNames[month];
          if (monthName) {
            labels.push({ month: monthName, colIndex });
            lastMonthKey = monthKey;
          }
        }
      }
    }
  });

  return labels;
}

/**
 * Get day labels for the graph based on week start.
 * Labels are shown at positions 1, 3, 5 (every other day starting from second).
 */
export function getDayLabelsForGraph(weekStart: WeekStartDay): string[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels: string[] = ["", "", "", "", "", "", ""];

  // Fixed label positions: 1, 3, 5 (0-indexed: showing 2nd, 4th, 6th days)
  const labelPositions = [1, 3, 5];

  for (const pos of labelPositions) {
    // Calculate which actual day of week this position represents
    const actualDayIndex = (weekStart + pos) % 7;
    labels[pos] = dayNames[actualDayIndex]!;
  }

  return labels;
}
