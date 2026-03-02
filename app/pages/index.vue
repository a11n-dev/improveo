<script setup lang="ts">
import { motion } from "motion-v";

definePageMeta({
  keepalive: true,
});

const HABITS_KEY = "habits";

const habitsStore = useHabitsStore();
const settingsStore = useSettingsStore();
const { habits, weekStart } = storeToRefs(habitsStore);
const { reduceAnimationsEnabled } = storeToRefs(settingsStore);
const { data: cachedHabits } = useNuxtData<HabitsListResponse>(HABITS_KEY);

const { pending } = useAsyncData<HabitsListResponse>(
  HABITS_KEY,
  (_nuxtApp, { signal }) =>
    $fetch<HabitsListResponse>("/api/habits", {
      headers: useRequestHeaders(["cookie"]),
      signal,
    }),
  {
    default: () =>
      cachedHabits.value ?? { habits: [], weekStart: 0 as WeekStartDay },
  },
);

const motionReducedPolicy = computed(() =>
  reduceAnimationsEnabled.value ? "always" : "never",
);

const infoOpen = ref(false);
const selectedHabitId = ref<string | null>(null);

const selectedHabit = computed<Habit | null>(() => {
  if (!selectedHabitId.value) {
    return null;
  }

  return habitsStore.getHabitById(selectedHabitId.value) ?? null;
});

const { openOverlay: openCreate } = useHabitCreateOverlay();
const route = useRoute();
const shouldScrollAfterHabitCreate = useState<boolean>(
  "habit-created-pending-scroll",
  () => false,
);

/** Today's date string used for card completion toggle. */
const todayStr = toISODateString(new Date());

/** Tracks delete request progress for the info overlay footer action. */
const isDeleting = ref(false);

/** Returns whether a habit has a completion record for today. */
const isCompletedToday = (habitId: string): boolean => {
  const habit = habitsStore.getHabitById(habitId);
  return habit?.completions[todayStr] ?? false;
};

/** Toggles today's completion state for the provided habit. */
const handleTodayToggle = async (
  habitId: string,
  _value: boolean,
): Promise<void> => {
  await habitsStore.toggleCompletion(habitId, todayStr);
};

/** Opens habit info overlay for the selected habit id. */
const handleInfo = (habitId: string): void => {
  if (!habitsStore.getHabitById(habitId)) {
    return;
  }

  selectedHabitId.value = habitId;
  infoOpen.value = true;
};

/** Toggles completion for a date selected from the info calendar. */
const handleToggleDate = async (date: string): Promise<void> => {
  if (!selectedHabit.value) {
    return;
  }

  await habitsStore.toggleCompletion(selectedHabit.value.id, date);
};

/** Closes the info overlay. */
const closeInfo = (): void => {
  infoOpen.value = false;
};

/** Deletes currently selected habit and closes overlay on success. */
const handleDelete = async (): Promise<void> => {
  if (!selectedHabit.value) {
    return;
  }

  isDeleting.value = true;

  try {
    const success = await habitsStore.deleteHabit(selectedHabit.value.id);

    if (success) {
      closeInfo();
    }
  } finally {
    isDeleting.value = false;
  }
};

/** Scrolls to the bottom of the page after creating a new habit. */
const scrollToBottom = (): void => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

watch(infoOpen, (isOpen): void => {
  if (!isOpen) {
    selectedHabitId.value = null;
  }
});

watch(
  [shouldScrollAfterHabitCreate, () => route.path, pending],
  ([shouldScroll, currentPath, isPending]) => {
    if (!shouldScroll || currentPath !== "/" || isPending) {
      return;
    }

    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
        shouldScrollAfterHabitCreate.value = false;
      }, 300);
    });
  },
  { immediate: true },
);
</script>

<template>
  <UContainer class="py-8">
    <!-- Initial loading state (no cached habits yet) -->
    <div
      v-if="pending && habits.length === 0"
      class="fixed inset-0 flex items-center justify-center"
    >
      <LoadingState />
    </div>

    <MotionConfig
      v-else
      :reduced-motion="motionReducedPolicy"
      :transition="{ duration: 0.2, ease: 'easeOut' }"
    >
      <!-- Empty state -->
      <div
        v-if="habits.length === 0"
        class="fixed inset-0 flex items-center justify-center"
      >
        <UEmpty
          icon="i-lucide-list-checks"
          title="No habits yet"
          description="Create your first habit to start tracking your progress."
        >
          <template #actions>
            <UButton
              label="Create Habit"
              icon="i-lucide-plus"
              color="primary"
              variant="solid"
              @click="openCreate"
            />
          </template>
        </UEmpty>
      </div>

      <!-- Habits list -->
      <div v-else class="flex flex-col gap-4">
        <AnimatePresence :initial="false">
          <motion.div
            v-for="habit in habits"
            :key="habit.id"
            layout
            :initial="{ opacity: 0, y: 8, scale: 0.9 }"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :exit="{ opacity: 0, y: -8, scale: 0.9 }"
          >
            <HabitsCard
              :habit="habit"
              :week-start="weekStart"
              :completed="isCompletedToday(habit.id)"
              @update:completed="handleTodayToggle(habit.id, $event)"
              @info="handleInfo(habit.id)"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>

    <!-- Habit Info Overlay -->
    <LazyHabitsInfoOverlay
      v-if="selectedHabit"
      v-model:open="infoOpen"
      :habit="selectedHabit"
      :week-start="weekStart"
      :is-deleting="isDeleting"
      @toggle-date="handleToggleDate"
      @delete="handleDelete"
    />
  </UContainer>
</template>
