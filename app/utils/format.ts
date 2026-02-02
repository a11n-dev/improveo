/**
 * Format seconds into MM:SS countdown format.
 */
export const formatCountdown = (seconds: number): string => {
  const clamped = Math.max(seconds, 0);
  const minutes = Math.floor(clamped / 60);
  const remainingSeconds = clamped % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

/**
 * Format ISO date (YYYY-MM-DD) to display format (DD-MM-YYYY).
 */
export const formatDateDisplay = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}-${month}-${year}`;
};

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Format ISO date (YYYY-MM-DD) to display format with weekday (e.g. "Sat, 31-01-2026").
 */
export const formatDateWithWeekday = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;

  // Parse date to get weekday
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const weekday = WEEKDAY_NAMES[date.getDay()];

  return `${weekday}, ${day}-${month}-${year}`;
};

/**
 * Format streak goal for display (e.g., "Daily", "3 / week").
 */
export const formatStreakGoalLabel = (
  streakInterval: StreakInterval | null,
  streakCount: number,
): string => {
  if (!streakInterval) return "";

  const intervalMap: Record<StreakInterval, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
  };
  const interval = intervalMap[streakInterval];

  if (streakCount === 1 && streakInterval === "daily") {
    return "Daily";
  }
  return `${streakCount} / ${interval}`;
};

const MONTH_NAMES = [
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

/**
 * Format ISO timestamp to "Since Mmm YYYY" format.
 */
export const formatMemberSince = (timestamp: string): string => {
  const date = new Date(timestamp);
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `Since ${month} ${year}`;
};
