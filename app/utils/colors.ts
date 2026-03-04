/**
 * Creates a color with appended alpha channel.
 */
export const dimColor = (hexColor: string, opacity: number = 0x20): string => {
  return `${hexColor}${opacity.toString(16).padStart(2, "0")}`;
};

/**
 * Preset habit colors for the color picker swatches.
 * 24 balanced hues covering the spectrum.
 */
export const habitColorPresets = [
  // Reds & Pinks
  "#EF4444", // red-500
  "#F43F5E", // rose-500
  "#EC4899", // pink-500
  "#D946EF", // fuchsia-500
  // Purples & Violets
  "#A855F7", // purple-500
  "#8B5CF6", // violet-500
  "#7C3AED", // violet-600
  "#6366F1", // indigo-500
  // Blues
  "#3B82F6", // blue-500
  "#0EA5E9", // sky-500
  "#06B6D4", // cyan-500
  "#14B8A6", // teal-500
  // Greens
  "#10B981", // emerald-500
  "#22C55E", // green-500
  "#84CC16", // lime-500
  "#A3E635", // lime-400
  // Yellows & Oranges
  "#FACC15", // yellow-400
  "#EAB308", // yellow-500
  "#F59E0B", // amber-500
  "#F97316", // orange-500
  // Neutrals & Browns
  "#78716C", // stone-500
  "#57534E", // stone-600
  "#64748B", // slate-500
  "#475569", // slate-600
] as const;

export type HabitColor = (typeof habitColorPresets)[number] | string;
