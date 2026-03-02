type ShellShiftVariant = "base" | "shifted";

const REDUCED_MOTION_TRANSITION = { duration: 0 };
const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 340,
  damping: 34,
  mass: 0.9,
};

const SHELL_SHIFT_VARIANTS = {
  base: { x: "0vw" },
  shifted: { x: "-24vw" },
} as const;

/**
 * Shared motion configuration for app-shell shift animations.
 *
 * Keeps page content, bottom navigation, and FAB movement synchronized.
 */
export const useShiftMotion = () => {
  const settingsStore = useSettingsStore();
  const { reduceAnimationsEnabled } = storeToRefs(settingsStore);
  const isProfileShellShifted = useState<boolean>(
    "profile-shell-shifted",
    () => false,
  );

  const shellVariant = computed<ShellShiftVariant>(() => {
    if (reduceAnimationsEnabled.value) {
      return "base";
    }

    return isProfileShellShifted.value ? "shifted" : "base";
  });

  const shellTransition = computed(() =>
    reduceAnimationsEnabled.value
      ? REDUCED_MOTION_TRANSITION
      : SPRING_TRANSITION,
  );

  return {
    isProfileShellShifted,
    shellTransition,
    shellVariant,
    shellVariants: SHELL_SHIFT_VARIANTS,
  };
};
