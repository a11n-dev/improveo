<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";

const { draft } = useHabitDraft();

const open = defineModel<boolean>("open", { default: false });

/** Radio options for streak interval */
const intervalItems: RadioGroupItem[] = [
  { label: "None", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

/** Current interval selection (bound to radio group) */
const selectedInterval = ref<string>("none");

/** Completions count for weekly/monthly */
const completionsCount = ref(1);

/** Max completions based on interval */
const maxCompletions = computed(() => {
  if (selectedInterval.value === "weekly") return 7;
  if (selectedInterval.value === "monthly") return 31;
  return 1;
});

/** Period label for display */
const periodLabel = computed(() => {
  if (selectedInterval.value === "weekly") return "Week";
  if (selectedInterval.value === "monthly") return "Month";
  return "";
});

/** Whether to show completions counter */
const showCompletions = computed(() =>
  ["weekly", "monthly"].includes(selectedInterval.value),
);

/** Decrement completions (min 1) */
const decrement = () => {
  if (completionsCount.value > 1) {
    completionsCount.value--;
  }
};

/** Increment completions (max based on interval) */
const increment = () => {
  if (completionsCount.value < maxCompletions.value) {
    completionsCount.value++;
  }
};

/** Sync local state from draft on open */
watch(open, (isOpen) => {
  if (isOpen) {
    if (draft.value.streak) {
      selectedInterval.value = draft.value.streak.interval;
      completionsCount.value = draft.value.streak.count;
    } else {
      selectedInterval.value = "none";
      completionsCount.value = 1;
    }
  }
});

/** Reset completions when interval changes */
watch(selectedInterval, () => {
  completionsCount.value = 1;
});

/** Save selection and close */
const save = () => {
  if (selectedInterval.value === "none") {
    draft.value.streak = null;
  } else {
    draft.value.streak = {
      interval: selectedInterval.value as StreakInterval,
      count: selectedInterval.value === "daily" ? 1 : completionsCount.value,
    };
  }
  open.value = false;
};

const title = "Streak Goal";

const drawerProps = {
  nested: true,
};
</script>

<template>
  <HabitsOverlayResponsive
    v-model:open="open"
    :title="title"
    :drawer-props="drawerProps"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Interval" name="interval">
          <URadioGroup
            v-model="selectedInterval"
            :items="intervalItems"
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

    <template #footer>
      <div class="flex w-full flex-col gap-2">
        <UButton label="Save" color="neutral" block @click="save" />
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          block
          @click="open = false"
        />
      </div>
    </template>
  </HabitsOverlayResponsive>
</template>
