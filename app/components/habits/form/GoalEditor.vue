<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";

type GoalPeriodSelection = PeriodType | "none";

interface Props {
  goal: Goal | null;
}

const { goal } = defineProps<Props>();

const emit = defineEmits<{
  "update:goal": [goal: Goal | null];
}>();

const open = defineModel<boolean>("open", { default: false });

/** Available goal period options shown in the interval selector. */
const periodItems: RadioGroupItem[] = [
  { label: "None", value: "none" },
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

const selectedPeriodType = ref<GoalPeriodSelection>("none");
const completionsCount = ref(1);
const isInitializing = ref(false);

/** Returns maximum allowed completions for the selected period. */
const maxCompletions = computed<number>(() => {
  if (selectedPeriodType.value === "week") {
    return 7;
  }

  if (selectedPeriodType.value === "month") {
    return 31;
  }

  return 1;
});

/** Returns period label shown next to completions count. */
const periodLabel = computed<string>(() => {
  if (selectedPeriodType.value === "week") {
    return "Week";
  }

  if (selectedPeriodType.value === "month") {
    return "Month";
  }

  return "";
});

/** Controls visibility of completions stepper for week/month goals. */
const showCompletions = computed<boolean>(
  () =>
    selectedPeriodType.value === "week" || selectedPeriodType.value === "month",
);

/** Decreases completions count while keeping minimum of 1. */
const handleDecrement = (): void => {
  if (completionsCount.value > 1) {
    completionsCount.value--;
  }
};

/** Increases completions count while respecting selected period max. */
const handleIncrement = (): void => {
  if (completionsCount.value < maxCompletions.value) {
    completionsCount.value++;
  }
};

/** Initializes local editor state each time the goal overlay opens. */
watch(open, (isOpen): void => {
  if (!isOpen) {
    return;
  }

  isInitializing.value = true;

  if (goal) {
    selectedPeriodType.value = goal.periodType;
    completionsCount.value = goal.targetCount;
  } else {
    selectedPeriodType.value = "none";
    completionsCount.value = 1;
  }

  nextTick(() => {
    isInitializing.value = false;
  });
});

/** Resets completions count when user changes period type manually. */
watch(selectedPeriodType, (): void => {
  if (isInitializing.value) {
    return;
  }

  completionsCount.value = 1;
});

/** Persists goal settings and closes the overlay. */
const handleSave = (): void => {
  if (selectedPeriodType.value === "none") {
    emit("update:goal", null);
  } else {
    emit("update:goal", {
      periodType: selectedPeriodType.value,
      targetCount:
        selectedPeriodType.value === "day" ? 1 : completionsCount.value,
    });
  }

  open.value = false;
};
</script>

<template>
  <CommonOverlay
    v-model:open="open"
    title="Goal"
    description="Set habit frequency."
    :actions="[
      {
        label: 'Save',
        color: 'primary',
        onClick: handleSave,
      },
    ]"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Interval" name="interval">
          <URadioGroup
            v-model="selectedPeriodType"
            :items="periodItems"
            variant="card"
            color="neutral"
          />
        </UFormField>

        <UFormField
          v-if="showCompletions"
          label="Completions per interval"
          name="completions"
        >
          <div class="flex items-center gap-2">
            <div
              class="flex h-10 flex-1 items-center rounded-md border border-muted bg-muted/50 px-3 text-sm text-muted"
            >
              {{ completionsCount }} / {{ periodLabel }}
            </div>
            <UButton
              icon="i-lucide-minus"
              color="neutral"
              :disabled="completionsCount <= 1"
              aria-label="Decrease"
              @click="handleDecrement"
            />
            <UButton
              icon="i-lucide-plus"
              color="neutral"
              :disabled="completionsCount >= maxCompletions"
              aria-label="Increase"
              @click="handleIncrement"
            />
          </div>
        </UFormField>
      </div>
    </template>
  </CommonOverlay>
</template>
