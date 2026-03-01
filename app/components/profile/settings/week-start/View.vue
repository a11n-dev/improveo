<script setup lang="ts">
interface WeekStartOption {
  label: string;
  value: number;
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

const settingsStore = useSettingsStore();
const { notifyMessage } = useNotify();
const { settings } = storeToRefs(settingsStore);

const selectedWeekStart = ref<number>(settings.value?.weekStart ?? 0);

/** Keeps local selection aligned with optimistic store updates/reverts. */
watch(
  () => settings.value?.weekStart,
  (value) => {
    selectedWeekStart.value = value ?? 0;
  },
  { immediate: true },
);

/** Applies week-start changes immediately after option selection. */
const handleWeekStartChange = async (value: number): Promise<void> => {
  if (value === settings.value?.weekStart) {
    return;
  }

  const isUpdated = await settingsStore.updateWeekStart(value);

  if (isUpdated) {
    return;
  }

  selectedWeekStart.value = settings.value?.weekStart ?? 0;
  notifyMessage({ scope: "settings", code: "update_failed" });
};
</script>

<template>
  <CommonSingleViewItem variant="plain">
    <URadioGroup
      v-model="selectedWeekStart"
      :items="WEEK_START_OPTIONS"
      value-key="value"
      variant="card"
      color="neutral"
      @update:model-value="handleWeekStartChange"
    />
  </CommonSingleViewItem>
</template>
