<script setup lang="ts">
interface Props {
  modelValue: number;
}

interface Emits {
  /** Emitted when week start selection changes. */
  (e: "update:modelValue", value: number): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const weekStartOptions = [
  { label: "Monday", value: 0 },
  { label: "Tuesday", value: 1 },
  { label: "Wednesday", value: 2 },
  { label: "Thursday", value: 3 },
  { label: "Friday", value: 4 },
  { label: "Saturday", value: 5 },
  { label: "Sunday", value: 6 },
];

const handleChange = (value: number): void => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex flex-col gap-1 min-w-0 flex-1">
      <span class="text-sm font-medium text-highlighted">Week start</span>
      <span class="text-xs text-muted"
        >First day of the week in the calendar</span
      >
    </div>
    <USelect
      :model-value="modelValue"
      :items="weekStartOptions"
      class="w-34 shrink-0"
      :content="{
        onCloseAutoFocus: (e) => e.preventDefault(),
      }"
      @update:model-value="handleChange"
    />
  </div>
</template>
