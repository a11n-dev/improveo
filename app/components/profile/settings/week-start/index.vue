<script setup lang="ts">
const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const emit = defineEmits<{
  open: [];
}>();

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

/** Human-readable week-start label from the settings store. */
const selectedWeekStartLabel = computed(() => {
  const value = settings.value?.weekStart ?? 0;
  return WEEKDAY_LABELS[value] ?? "Monday";
});

/** Opens the dedicated week-start settings screen. */
const handleOpen = (): void => {
  emit("open");
};
</script>

<template>
  <ProfileSettingsField
    title="Start Week On"
    description="First day of the week in the calendar"
    icon="i-lucide-calendar-days"
    :value="selectedWeekStartLabel"
    clickable
    show-chevron
    @click="handleOpen"
  />
</template>
