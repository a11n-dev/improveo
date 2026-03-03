<script setup lang="ts">
import { WEEKDAY_LABELS } from "~~/shared/constants/weekdays";

/** Ordered weekday options used by the week-start selector. */
const WEEK_START_OPTIONS = WEEKDAY_LABELS.map((label, value) => ({
  label,
  value: value as WeekStartDay,
}));

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

/** Persists a new week-start value when it differs from current state. */
const handleWeekStartChange = async (value: WeekStartDay): Promise<void> => {
  if (settings.value === null || value === settings.value.weekStart) {
    return;
  }

  await settingsStore.updateWeekStart(value);
};

/** Two-way model bound directly to persisted settings state. */
const selectedWeekStart = computed<WeekStartDay>({
  get: () => (settings.value?.weekStart ?? 0) as WeekStartDay,
  set: (value) => {
    void handleWeekStartChange(value);
  },
});
</script>

<template>
  <CommonSingleViewItem variant="plain">
    <URadioGroup
      v-model="selectedWeekStart"
      :items="WEEK_START_OPTIONS"
      value-key="value"
      variant="card"
      color="neutral"
    />
  </CommonSingleViewItem>
</template>
