<script setup lang="ts">
import SettingField from "./SettingField.vue";

interface Props {
  modelValue: number;
}

interface Emits {
  /** Emitted when week start selection changes. */
  (e: "update:modelValue", value: number): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

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

watch(
  () => props.modelValue,
  (value) => {
    if (!open.value) {
      draftWeekStart.value = value;
    }
  },
);

const openEditor = (): void => {
  draftWeekStart.value = props.modelValue;
  open.value = true;
};

const saveWeekStart = (): void => {
  if (draftWeekStart.value !== props.modelValue) {
    emit("update:modelValue", draftWeekStart.value);
  }

  open.value = false;
};
</script>

<template>
  <div class="space-y-3">
    <SettingField
      title="Week start"
      description="First day of the week in the calendar"
      :value="selectedWeekStartLabel"
      clickable
      show-chevron
      @click="openEditor"
    />

    <ResponsiveOverlay
      v-model:open="open"
      title="Week start"
      description="First day of the week in the calendar"
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

      <template #footer>
        <div class="flex w-full flex-col gap-2">
          <UButton label="Save" color="neutral" block @click="saveWeekStart" />
        </div>
      </template>
    </ResponsiveOverlay>
  </div>
</template>
