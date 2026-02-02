<script setup lang="ts">
/**
 * Props for the WeekStart component.
 */
interface Props {
  /** Current week start value (0 = Sunday, 6 = Saturday). */
  modelValue: number;
}

/**
 * Emits for the WeekStart component.
 */
interface Emits {
  /** Emitted when week start selection changes. */
  (e: "update:modelValue", value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Week start options for the select dropdown.
 * 0 = Sunday through 6 = Saturday (matching profiles.week_start DB column).
 */
const weekStartOptions = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

/**
 * Handle week start change from USelect.
 */
const handleChange = (value: number): void => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex flex-col gap-1 min-w-0 flex-1">
      <span class="text-sm font-medium text-highlighted">Week Start</span>
      <span class="text-xs text-muted">First day of the week in calendar</span>
    </div>
    <USelect
      :model-value="modelValue"
      :items="weekStartOptions"
      class="w-34 shrink-0"
      @update:model-value="handleChange"
    />
  </div>
</template>
