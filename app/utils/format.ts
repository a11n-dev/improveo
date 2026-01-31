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
