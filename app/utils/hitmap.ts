import {
  getDayIndexForWeekStart,
  getDayLabels,
  toISODateString,
} from "~~/shared/utils/weekStart";

/** Single cell data used by the habits hitmap UI. */
export interface HitmapDay {
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** Indicates whether the day belongs to the visible range window. */
  inRange: boolean;
  /** Indicates whether the habit is completed on this date. */
  completed: boolean;
}

/** Input options for generating a habits hitmap matrix. */
export interface HabitHitmapOptions {
  endDate?: Date;
  daysCount?: number;
  weekStart: WeekStartDay;
  completions: Record<string, boolean>;
}

/** Formats a date to ISO date string (YYYY-MM-DD). */
export function formatHitmapDate(date: Date): string {
  return toISODateString(date);
}

/** Returns a new date shifted by `days` from `date`. */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Builds a habits hitmap matrix grouped by weeks.
 * Each outer array item is a week and each week contains seven `HitmapDay` rows.
 */
export function buildHabitHitmap(options: HabitHitmapOptions): HitmapDay[][] {
  const {
    endDate = new Date(),
    daysCount = 365,
    weekStart,
    completions,
  } = options;

  const rangeStart = addDays(endDate, -(daysCount - 1));
  const rangeEnd = endDate;

  const startDayIndex = getDayIndexForWeekStart(rangeStart, weekStart);
  const gridStart = addDays(rangeStart, -startDayIndex);

  const endDayIndex = getDayIndexForWeekStart(rangeEnd, weekStart);
  const gridEnd = addDays(rangeEnd, 6 - endDayIndex);

  const rangeStartStr = formatHitmapDate(rangeStart);
  const rangeEndStr = formatHitmapDate(rangeEnd);

  const days: HitmapDay[] = [];
  let current = gridStart;

  while (current <= gridEnd) {
    const dateStr = formatHitmapDate(current);

    days.push({
      date: dateStr,
      inRange: dateStr >= rangeStartStr && dateStr <= rangeEndStr,
      completed: completions[dateStr] ?? false,
    });

    current = addDays(current, 1);
  }

  const weeks: HitmapDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
}

/**
 * Returns abbreviated month labels with their corresponding week column index.
 * Labels are hidden for months represented by fewer than two in-range weeks.
 */
export function getHitmapMonthLabels(
  weeks: HitmapDay[][],
): { month: string; colIndex: number }[] {
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

  const monthKeys = weeks.map((week) => {
    const inRangeDay = week.find((day) => day.inRange);

    if (!inRangeDay) {
      return "";
    }

    const [yearStr, monthStr] = inRangeDay.date.split("-");
    return yearStr && monthStr ? `${yearStr}-${monthStr}` : "";
  });

  const monthCounts = monthKeys.reduce<Record<string, number>>(
    (accumulator, monthKey) => {
      if (monthKey) {
        accumulator[monthKey] = (accumulator[monthKey] ?? 0) + 1;
      }

      return accumulator;
    },
    {},
  );

  const labels: { month: string; colIndex: number }[] = [];
  let lastMonthKey = "";

  monthKeys.forEach((monthKey, colIndex) => {
    if (!monthKey || monthKey === lastMonthKey) {
      return;
    }

    const monthStr = monthKey.split("-")[1];
    if (monthStr && (monthCounts[monthKey] ?? 0) >= 2) {
      const monthName = monthNames[parseInt(monthStr, 10) - 1];

      if (monthName) {
        labels.push({ month: monthName, colIndex });
      }
    }

    lastMonthKey = monthKey;
  });

  return labels;
}

/** Returns y-axis day labels for the habits hitmap according to week start. */
export function getDayLabelsForHitmap(weekStart: WeekStartDay): string[] {
  return getDayLabels(weekStart);
}
