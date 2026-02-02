/**
 * Composable for controlling the habit edit overlay state.
 * Can be used from any component to open/close the edit overlay.
 */
export const useHabitEditOverlay = () => {
  const isOpen = useState("habit-edit-open", () => false);
  const editingHabitId = useState<string | null>("habit-edit-id", () => null);
  const { initializeFromHabit, resetDraft } = useHabitEditDraft();

  /** Open the overlay with a habit to edit */
  const openOverlay = (habit: Habit) => {
    editingHabitId.value = habit.id;
    initializeFromHabit(habit);
    isOpen.value = true;
  };

  /** Close the overlay */
  const closeOverlay = () => {
    isOpen.value = false;
  };

  /** Reset and close */
  const resetAndClose = () => {
    resetDraft();
    editingHabitId.value = null;
    isOpen.value = false;
  };

  return {
    isOpen,
    editingHabitId,
    openOverlay,
    closeOverlay,
    resetAndClose,
  };
};
