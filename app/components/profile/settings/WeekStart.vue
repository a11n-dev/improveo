<script setup lang="ts">
const props = defineProps<{ modelValue: number }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

const open = ref(false);
const draftWeekStart = ref(props.modelValue);

const fullWeekdayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const weekStartOptions = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 1 },
  { label: "Wed", value: 2 },
  { label: "Thu", value: 3 },
  { label: "Fri", value: 4 },
  { label: "Sat", value: 5 },
  { label: "Sun", value: 6 },
];

const selectedWeekStartLabel = computed(() => {
  return fullWeekdayLabels[props.modelValue] ?? "Monday";
});

/**
 * Keeps draft value in sync with external model updates when editor is closed.
 */
watch(
  () => props.modelValue,
  (value) => {
    if (!open.value) {
      draftWeekStart.value = value;
    }
  },
);

/**
 * Opens the editor and initializes draft from current model value.
 */
const openEditor = (): void => {
  draftWeekStart.value = props.modelValue;
  open.value = true;
};

/**
 * Persists draft only when value changed, then closes the editor.
 */
const saveWeekStart = (): void => {
  if (draftWeekStart.value !== props.modelValue) {
    emit("update:modelValue", draftWeekStart.value);
  }

  open.value = false;
};
</script>

<template>
  <div class="space-y-3">
    <ProfileSettingsField
      title="Week start"
      description="First day of the week in the calendar"
      icon="i-lucide-calendar-days"
      :value="selectedWeekStartLabel"
      clickable
      show-chevron
      @click="openEditor"
    />

    <CommonOverlay
      v-model:open="open"
      title="Week start"
      description="First day of the week in the calendar"
      :actions="[
        {
          label: 'Save',
          color: 'primary',
          onClick: saveWeekStart,
        },
      ]"
    >
      <template #body>
        <URadioGroup
          v-model="draftWeekStart"
          :items="weekStartOptions"
          value-key="value"
          variant="card"
          orientation="horizontal"
          indicator="hidden"
          color="neutral"
          :ui="{
            fieldset: 'gap-x-1 md:gap-x-2',
            item: 'flex-1 p-2',
          }"
        />
      </template>
    </CommonOverlay>
  </div>
</template>
