/**
 * Composable for controlling the habit creation overlay state.
 * Can be used from any component to open/close the overlay.
 */
export const useHabitCreateOverlay = () => {
  const isOpen = useState("habit-create-open", () => false);
  const { resetDraft } = useHabitDraft();
  const { tap: tapHaptic } = useHaptics();

  /** Open the overlay and reset draft to defaults */
  const openOverlay = () => {
    tapHaptic("base");
    resetDraft();
    isOpen.value = true;
  };

  /** Close the overlay */
  const closeOverlay = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    openOverlay,
    closeOverlay,
  };
};
