import { OTP_RESEND_COOLDOWN_SECONDS } from "~~/shared/constants/auth";

export const useResendCooldown = (initialSeconds = 0) => {
  const secondsLeft = ref(Math.max(0, Math.floor(initialSeconds)));

  const isActive = computed(() => secondsLeft.value > 0);

  const start = (seconds = OTP_RESEND_COOLDOWN_SECONDS): void => {
    secondsLeft.value = Math.max(0, Math.floor(seconds));
  };

  const stop = (): void => {
    secondsLeft.value = 0;
  };

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
