/**
 * Composable for controlling the habit info overlay state.
 * Can be used from any component to open/close the overlay.
 */
export const useHabitInfoOverlay = () => {
  const isOpen = useState("habit-info-open", () => false);
  const selectedHabitId = useState<string | null>(
    "habit-info-selected-id",
    () => null,
  );

  const { getHabitById } = useHabits();

  /** Selected habit (computed from ID for reactivity) */
  const selectedHabit = computed(() => {
    if (!selectedHabitId.value) return null;
    return getHabitById(selectedHabitId.value) ?? null;
  });

  /** Open the overlay with a specific habit */
  const openOverlay = (habit: Habit) => {
    selectedHabitId.value = habit.id;
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
