type HapticPatternName = "base";

/**
 * Vibration patterns used by the Web Vibration API.
 * `base` is intentionally short to feel like a subtle tap.
 */
const HAPTIC_PATTERNS: Record<HapticPatternName, number | number[]> = {
  base: 8,
};

/** Minimum time between taps to avoid haptic spam on rapid interactions. */
const HAPTIC_MIN_INTERVAL_MS = 80;
const FALLBACK_CONTAINER_ID = "haptic-switch-fallback";
const FALLBACK_INPUT_ID = "haptic-switch-fallback-input";

/**
 * Ensures a hidden checkbox+label pair exists for best-effort haptic fallback.
 *
 * Some browsers may provide light tactile feedback when a native-like control
 * is toggled, even if `navigator.vibrate` is unavailable.
 */
const ensureFallbackLabel = (): HTMLLabelElement | null => {
  if (!import.meta.client) {
    return null;
  }

  const existingLabel = document.querySelector<HTMLLabelElement>(
    `#${FALLBACK_CONTAINER_ID} label`,
  );
  if (existingLabel) {
    return existingLabel;
  }

  const container = document.createElement("div");
  container.id = FALLBACK_CONTAINER_ID;
  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.opacity = "0";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = FALLBACK_INPUT_ID;
  input.setAttribute("switch", "");

  const label = document.createElement("label");
  label.htmlFor = FALLBACK_INPUT_ID;

  container.append(input, label);
  document.body.append(container);

  return label;
};

const triggerFallbackHaptic = (): void => {
  const label = ensureFallbackLabel();
  if (!label) {
    return;
  }

  label.click();
};

export const useHaptics = () => {
  const lastTapAt = useState<number>("haptics-last-tap-at", () => 0);

  /**
   * Triggers haptic feedback with the requested named pattern.
   */
  const tap = (pattern: HapticPatternName = "base"): void => {
    if (!import.meta.client) {
      return;
    }

    const now = Date.now();
    if (now - lastTapAt.value < HAPTIC_MIN_INTERVAL_MS) {
      return;
    }

    lastTapAt.value = now;

    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
      return;
    }

    triggerFallbackHaptic();
  };

  return {
    tap,
  };
};
