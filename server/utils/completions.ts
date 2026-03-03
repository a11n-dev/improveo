const isLeapYear = (year: number): boolean => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

const getDaysInYear = (year: number): number => (isLeapYear(year) ? 366 : 365);

const parseBytea = (value: string): Uint8Array => {
  if (!value) return new Uint8Array();
  if (value.startsWith("\\x") || value.startsWith("0x")) {
    const hex = value.slice(2);
    return new Uint8Array(Buffer.from(hex, "hex"));
  }

  try {
    return new Uint8Array(Buffer.from(value, "base64"));
  } catch {
    return new Uint8Array();
  }
};

const getBit = (bytes: Uint8Array, index: number): boolean => {
  const byteIndex = Math.floor(index / 8);
  if (byteIndex >= bytes.length) return false;
  const bitIndex = index % 8;
  return ((bytes[byteIndex] ?? 0) >> bitIndex) & 1 ? true : false;
};

const getDateStringFromDayOfYear = (
  year: number,
  dayOfYear: number,
): string => {
  const date = new Date(year, 0, dayOfYear);
  return toISODateString(date);
};

/**
 * Decode a bytea bitmap into a date map, filtering by an inclusive date range.
 * Assumes bit index matches day-of-year (Jan 1 => index 0).
 */
export const decodeBitmapToCompletionMap = (
  bitmap: string,
  year: number,
  fromStr: string,
  toStr: string,
): Record<string, boolean> => {
  const bytes = parseBytea(bitmap);
  const daysInYear = getDaysInYear(year);
  const completions: Record<string, boolean> = {};

  for (let day = 1; day <= daysInYear; day++) {
    const bitIndex = day - 1;
    if (!getBit(bytes, bitIndex)) continue;
    const dateStr = getDateStringFromDayOfYear(year, day);
    if (dateStr < fromStr || dateStr > toStr) continue;
    completions[dateStr] = true;
  }

  return completions;
};

/**
 * Decode a bytea bitmap into ISO date strings for a given year.
 * Assumes bit index matches day-of-year (Jan 1 => index 0).
 */
export const decodeBitmapToCompletionDates = (
  bitmap: string,
  year: number,
): string[] => {
  const bytes = parseBytea(bitmap);
  const daysInYear = getDaysInYear(year);
  const dates: string[] = [];

  for (let day = 1; day <= daysInYear; day++) {
    const bitIndex = day - 1;
    if (!getBit(bytes, bitIndex)) continue;
    dates.push(getDateStringFromDayOfYear(year, day));
  }

  return dates;
};

/**
 * Parse packed bytea counters into a number array.
 * Each byte is a uint8 counter value.
 */
export const parsePackedCounts = (bytea: string): number[] => {
  const bytes = parseBytea(bytea);
  return Array.from(bytes);
};
