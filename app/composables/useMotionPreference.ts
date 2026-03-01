import { storeToRefs } from "pinia";

type MotionReducedPolicy = "always" | "never";

/**
 * Shared motion policy derived from user settings.
 *
 * - `reduceAnimations = true`  -> reduced motion always on
 * - `reduceAnimations = false` -> full motion always on
 */
export const useMotionPreference = () => {
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);

  const reduceAnimationsEnabled = computed(
    () => settings.value?.reduceAnimations ?? false,
  );

  const motionReducedPolicy = computed<MotionReducedPolicy>(() =>
    reduceAnimationsEnabled.value ? "always" : "never",
  );

  return {
    motionReducedPolicy,
    reduceAnimationsEnabled,
  };
};
