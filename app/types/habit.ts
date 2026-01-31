/** Habit data for display in the card */
export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: HabitColor;
  streak?: StreakGoal;
  /** Current streak count (consecutive completions) */
  currentStreakCount: number;
  /** Completion map: date (YYYY-MM-DD) -> completed */
  completions: Record<string, boolean>;
}
