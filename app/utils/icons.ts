/**
 * Preset habit icons for quick selection.
 * 24 common icons for habits like fitness, learning, wellness, etc.
 */
export const habitIconPresets = [
  "i-lucide-dumbbell", // fitness
  "i-lucide-book-open", // reading
  "i-lucide-droplets", // hydration
  "i-lucide-bed", // sleep
  "i-lucide-brain", // meditation/learning
  "i-lucide-heart", // health/wellness
  "i-lucide-apple", // nutrition
  "i-lucide-footprints", // walking/steps
  "i-lucide-pencil", // journaling/writing
  "i-lucide-music", // music practice
  "i-lucide-code", // coding
  "i-lucide-sun", // morning routine
  "i-lucide-moon", // evening routine
  "i-lucide-pill", // medication
  "i-lucide-phone-off", // screen time
  "i-lucide-smile", // gratitude/mood
  "i-lucide-target", // goals
  "i-lucide-clock", // time management
  "i-lucide-utensils", // meals
  "i-lucide-bike", // cycling
  "i-lucide-cigarette-off", // quit smoking
  "i-lucide-wallet", // finances
  "i-lucide-languages", // language learning
  "i-lucide-palette", // creative/art
] as const;

/**
 * Lazy-load the full Lucide icon class list for the icon picker.
 */
export const loadLucideIconClasses = async (): Promise<string[]> => {
  const { icons } = await import("@iconify-json/lucide");
  return Object.keys(icons.icons).map((name) => `i-lucide-${name}`);
};
