/**
 * Composable for controlling the habit creation overlay state.
 * Can be used from any component to open/close the overlay.
 */
export const useHabitCreateOverlay = () => {
  const isOpen = useState("habit-create-open", () => false);
  const { tap: tapHaptic } = useHaptics();

  /** Opens create overlay from any trigger location in the app. */
  const openOverlay = (): void => {
    tapHaptic("base");
    isOpen.value = true;
  };

  /** Closes create overlay. */
  const closeOverlay = (): void => {
    isOpen.value = false;
  };

  return {
    isOpen,
    openOverlay,
    closeOverlay,
  };
};
