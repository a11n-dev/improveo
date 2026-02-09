<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";

interface Props {
  goal: Goal | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:goal": [goal: Goal | null];
}>();

const open = defineModel<boolean>("open", { default: false });

/** Radio options for goal period type */
const periodItems: RadioGroupItem[] = [
  { label: "None", value: "none" },
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

/** Current period type selection (bound to radio group) */
const selectedPeriodType = ref<string>("none");

/** Completions count for weekly/monthly */
const completionsCount = ref(1);

/** Flag to skip resetting completions during initialization */
const isInitializing = ref(false);

/** Max completions based on period type */
const maxCompletions = computed(() => {
  if (selectedPeriodType.value === "week") return 7;
  if (selectedPeriodType.value === "month") return 31;
  return 1;
});

/** Period label for display */
const periodLabel = computed(() => {
  if (selectedPeriodType.value === "week") return "Week";
  if (selectedPeriodType.value === "month") return "Month";
  return "";
});

/** Whether to show completions counter */
const showCompletions = computed(() =>
  ["week", "month"].includes(selectedPeriodType.value),
);

/** Decrement completions (min 1) */
const decrement = () => {
  if (completionsCount.value > 1) {
    completionsCount.value--;
  }
};

/** Increment completions (max based on period type) */
const increment = () => {
  if (completionsCount.value < maxCompletions.value) {
    completionsCount.value++;
  }
};

/** Sync local state from props on open */
watch(open, (isOpen) => {
  if (isOpen) {
    isInitializing.value = true;
    if (props.goal) {
      selectedPeriodType.value = props.goal.periodType;
      completionsCount.value = props.goal.targetCount;
    } else {
      selectedPeriodType.value = "none";
      completionsCount.value = 1;
    }
    // Reset flag after Vue processes the period type change
    nextTick(() => {
      isInitializing.value = false;
    });
  }
});

/** Reset completions when period type changes (but not during initialization) */
watch(selectedPeriodType, () => {
  if (!isInitializing.value) {
    completionsCount.value = 1;
  }
});

/** Save selection and close */
const save = () => {
  if (selectedPeriodType.value === "none") {
    emit("update:goal", null);
  } else {
    emit("update:goal", {
      periodType: selectedPeriodType.value as PeriodType,
      targetCount:
        selectedPeriodType.value === "day" ? 1 : completionsCount.value,
    });
  }
  open.value = false;
};

const title = "Goal";

const drawerProps = {
  nested: true,
};
</script>

<template>
  <CommonOverlay
    v-model:open="open"
    :title="title"
    :drawer-props="drawerProps"
    :actions="[
      {
        label: 'Save',
        color: 'primary',
        onClick: save,
      },
      {
        label: 'Cancel',
        color: 'secondary',
        onClick: () => (open = false),
      },
    ]"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Interval" name="interval">
          <URadioGroup
            v-model="selectedPeriodType"
            :items="periodItems"
            variant="table"
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
              variant="subtle"
              :disabled="completionsCount <= 1"
              aria-label="Decrease"
              @click="decrement"
            />
            <UButton
              icon="i-lucide-plus"
              color="neutral"
              variant="subtle"
              :disabled="completionsCount >= maxCompletions"
              aria-label="Increase"
              @click="increment"
            />
          </div>
        </UFormField>
      </div>
    </template>
  </CommonOverlay>
</template>
