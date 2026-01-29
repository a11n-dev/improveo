import { useMediaQuery } from "@vueuse/core";

/**
 * Detect whether the viewport matches the desktop breakpoint.
 * @returns {import("vue").ComputedRef<boolean>} True when viewport is desktop size.
 */
export const useIsDesktop = () => {
  return useMediaQuery("(min-width: 768px)");
};
