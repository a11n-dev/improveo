import { useMediaQuery } from "@vueuse/core";

/**
 * Detect whether the viewport matches the desktop breakpoint.
 */
export const useIsDesktop = () => {
  return useMediaQuery("(min-width: 768px)");
};
