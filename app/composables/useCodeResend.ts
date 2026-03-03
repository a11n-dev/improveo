import { OTP_RESEND_COOLDOWN_SECONDS } from "~~/shared/constants/auth";

/**
 * Composable to manage OTP code resend cooldown logic.
 */
export const useCodeResend = (initialSeconds = 0) => {
  const secondsLeft = ref(Math.max(0, Math.floor(initialSeconds)));

  const isActive = computed(() => secondsLeft.value > 0);

  /** Starts the countdown with the specified number of seconds. */
  const start = (seconds = OTP_RESEND_COOLDOWN_SECONDS): void => {
    secondsLeft.value = Math.max(0, Math.floor(seconds));
  };

  /** Stops the countdown and resets the seconds left to 0. */
  const stop = (): void => {
    secondsLeft.value = 0;
  };

  /** Countdown logic: decreases secondsLeft every second until it reaches 0. */
  watch(secondsLeft, (value, _, onCleanup) => {
    if (value <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      secondsLeft.value = value - 1;
    }, 1000);

    onCleanup(() => {
      clearTimeout(timeout);
    });
  });

  return {
    isActive,
    secondsLeft,
    start,
    stop,
  };
};
