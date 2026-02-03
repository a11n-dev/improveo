<script setup lang="ts">
interface Props {
  habit: Habit;
  weekStart?: WeekStartDay;
  isDeleting?: boolean;
}

const { habit, weekStart = 0, isDeleting = false } = defineProps<Props>();

const emit = defineEmits<{
  "toggle-date": [date: string];
  delete: [];
}>();

const open = defineModel<boolean>("open", { default: false });

const { openOverlay: openEditOverlay } = useHabitEditOverlay();

const modalProps = {
  close: false,
  ui: { footer: "flex-col gap-2" },
};

/** Streak goal label for legend */
const streakGoalLabel = computed(() =>
  formatStreakGoalLabel(habit.streakInterval, habit.streakCount),
);

/** Delete confirmation state */
const showDeleteConfirm = ref(false);

/** Handle edit button click - opens nested edit overlay */
const handleEdit = () => {
  openEditOverlay(habit);
};

/** Handle delete button click */
const handleDelete = () => {
  showDeleteConfirm.value = true;
};

/** Confirm delete */
const confirmDelete = () => {
  emit("delete");
};

/** Cancel delete */
const cancelDelete = () => {
  showDeleteConfirm.value = false;
};

/** Close overlay */
const handleClose = () => {
  open.value = false;
};
</script>

<template>
  <ResponsiveOverlay v-model:open="open" :modal-props="modalProps">
    <template #header>
      <HabitsInfoHeader :habit="habit" @close="handleClose" />
    </template>

    <template #body>
      <div
        class="flex flex-col gap-4"
        :style="{
          '--habit-color': habit.color,
          '--habit-color-hover': `color-mix(in srgb, ${habit.color} 70%, white)`,
          '--habit-color-light': `${habit.color}20`,
        }"
      >
        <HabitsGraph
          :color="habit.color"
          :completions="habit.completions"
          :week-start="weekStart"
          :show-legend="true"
          :current-streak="habit.currentStreak"
          :best-streak="habit.bestStreak"
          :has-streak="habit.streakInterval !== null"
          :streak-goal-label="streakGoalLabel"
        />

        <HabitsInfoCalendar
          :habit="habit"
          :week-start="weekStart"
          :open="open"
          @toggle-date="emit('toggle-date', $event)"
        />
      </div>
    </template>

    <template #footer>
      <!-- Delete confirmation -->
      <template v-if="showDeleteConfirm">
        <p class="mb-2 text-center text-sm text-muted">
          Are you sure you want to delete "{{ habit.title }}"? <br />
          This action cannot be undone.
        </p>
        <UButton
          label="Delete Habit"
          color="error"
          block
          class="justify-center"
          :loading="isDeleting"
          :disabled="isDeleting"
          @click="confirmDelete"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          block
          class="justify-center"
          :disabled="isDeleting"
          @click="cancelDelete"
        />
      </template>

      <!-- Normal actions -->
      <template v-else>
        <UButton
          label="Edit"
          color="neutral"
          variant="outline"
          block
          class="justify-center"
          @click="handleEdit"
        />
        <UButton
          label="Delete"
          color="error"
          variant="subtle"
          block
          class="justify-center"
          @click="handleDelete"
        />
        <UButton
          label="Close"
          color="neutral"
          variant="subtle"
          block
          class="justify-center"
          @click="handleClose"
        />
      </template>
    </template>

    <!-- Nested edit overlay (default slot for drawer context) -->
    <HabitsEditOverlay :habit="habit" />
  </ResponsiveOverlay>
</template>
