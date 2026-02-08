<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { habits, weekStart, pending, toggleCompletion, deleteHabit } =
  useHabits();

const {
  isOpen: infoOpen,
  selectedHabit,
  openOverlay: openInfo,
  closeOverlay: closeInfo,
} = useHabitInfoOverlay();

const { openOverlay: openCreate } = useHabitCreateOverlay();
const route = useRoute();
const shouldScrollAfterHabitCreate = useState<boolean>(
  "habit-created-pending-scroll",
  () => false,
);

/** Today's date string for checking completion */
const todayStr = toISODateString(new Date());

/** Delete loading state */
const isDeleting = ref(false);

/** Check if a habit is completed today */
const isCompletedToday = (habitId: string): boolean => {
  const habit = habits.value.find((h) => h.id === habitId);
  return habit?.completions[todayStr] ?? false;
};

/** Toggle today's completion for a habit */
const handleTodayToggle = async (habitId: string, _value: boolean) => {
  await toggleCompletion(habitId, todayStr);
};

/** Open info overlay for a habit */
const handleInfo = (habitId: string) => {
  const habit = habits.value.find((h) => h.id === habitId);
  if (habit) {
    openInfo(habit);
  }
};

/** Handle date toggle from info overlay */
const handleToggleDate = async (date: string) => {
  if (!selectedHabit.value) return;
  await toggleCompletion(selectedHabit.value.id, date);
};

/** Handle delete from info overlay */
const handleDelete = async () => {
  if (!selectedHabit.value) return;
  isDeleting.value = true;
  try {
    const success = await deleteHabit(selectedHabit.value.id);
    if (success) {
      closeInfo();
    }
  } finally {
    isDeleting.value = false;
  }
};

/** Scroll to bottom of page smoothly */
const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

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
    <!-- Loading state -->
    <div v-if="pending" class="fixed inset-0 flex items-center justify-center">
      <LoadingState />
    </div>

    <!-- Content with auto-animate for smooth transitions -->
    <div v-else v-auto-animate class="contents">
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
              @click="openCreate"
            />
          </template>
        </UEmpty>
      </div>

      <!-- Habits list -->
      <div v-else v-auto-animate class="flex flex-col gap-4">
        <HabitsCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          :week-start="weekStart"
          :completed="isCompletedToday(habit.id)"
          @update:completed="handleTodayToggle(habit.id, $event)"
          @info="handleInfo(habit.id)"
        />
      </div>
    </div>

    <!-- Habit Info Overlay -->
    <HabitsInfoOverlay
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
