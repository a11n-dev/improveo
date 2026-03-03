<script setup lang="ts">
interface WeekStartOption {
  label: string;
  value: WeekStartDay;
}

/** Ordered weekday options used by the week-start selector. */
const WEEK_START_OPTIONS: WeekStartOption[] = [
  { label: "Monday", value: 0 },
  { label: "Tuesday", value: 1 },
  { label: "Wednesday", value: 2 },
  { label: "Thursday", value: 3 },
  { label: "Friday", value: 4 },
  { label: "Saturday", value: 5 },
  { label: "Sunday", value: 6 },
];

const { notifyMessage } = useNotify();
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

/** Persists a new week-start value and emits a failure notification. */
const handleWeekStartChange = async (value: WeekStartDay): Promise<void> => {
  if (settings.value === null || value === settings.value.weekStart) {
    return;
  }

  const updated = await settingsStore.updateWeekStart(value);

  if (!updated) {
    notifyMessage({ scope: "settings", code: "update_failed" });
  }
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
