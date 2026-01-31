import type { Habit } from "~/types/habit";

/**
 * Composable for controlling the habit info overlay state.
 * Can be used from any component to open/close the overlay.
 */
export const useHabitInfoOverlay = () => {
  const isOpen = useState("habit-info-open", () => false);
  const selectedHabit = useState<Habit | null>(
    "habit-info-selected",
    () => null,
  );

  /** Open the overlay with a specific habit */
  const openOverlay = (habit: Habit) => {
    selectedHabit.value = habit;
    isOpen.value = true;
  };

  /** Close the overlay */
  const closeOverlay = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    selectedHabit,
    openOverlay,
    closeOverlay,
  };
};
