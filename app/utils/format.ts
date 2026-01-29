export const formatCountdown = (seconds: number): string => {
  const clamped = Math.max(seconds, 0);
  const minutes = Math.floor(clamped / 60);
  const remainingSeconds = clamped % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};
