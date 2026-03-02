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

const { tap: tapHaptic } = useHaptics();

const modalProps = {
  close: false,
  ui: { footer: "flex-col gap-2" },
};

/** Goal label for legend */
const goalLabel = computed(() =>
  formatGoalLabel(habit.goal?.periodType, habit.goal?.targetCount),
);

/** Delete confirmation state */
const showDeleteConfirm = ref(false);
const isEditOverlayMounted = ref(false);
const isEditOverlayOpen = ref(false);

/** Clears transient UI state whenever the info overlay closes. */
watch(open, (isOpen): void => {
  if (!isOpen) {
    showDeleteConfirm.value = false;
    isEditOverlayOpen.value = false;
    isEditOverlayMounted.value = false;
  }
});

/** Handle edit button click - opens nested edit overlay */
const handleEdit = async (): Promise<void> => {
  isEditOverlayMounted.value = true;
  await nextTick();
  isEditOverlayOpen.value = true;
};

/** Unmounts nested edit overlay after leave transition finishes. */
const handleEditOverlayAfterLeave = (): void => {
  isEditOverlayOpen.value = false;
  isEditOverlayMounted.value = false;
};

/** Handle delete button click */
const handleDelete = (): void => {
  tapHaptic("base");
  showDeleteConfirm.value = true;
};

/** Confirm delete */
const confirmDelete = (): void => {
  emit("delete");
};

/** Cancel delete */
const cancelDelete = (): void => {
  showDeleteConfirm.value = false;
};

/** Close overlay */
const handleClose = (): void => {
  open.value = false;
};
</script>

<template>
  <CommonOverlay v-model:open="open" :modal-props="modalProps">
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
        <HabitsHitmap
          :color="habit.color"
          :completions="habit.completions"
          :week-start="weekStart"
          :show-legend="true"
          :current-streak="habit.currentStreak"
          :best-streak="habit.bestStreak"
          :has-goal="habit.goal !== null"
          :goal-label="goalLabel"
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
      <CommonOverlayFooter
        :actions="[
          {
            type: 'confirm',
            color: 'danger',
            confirmText: 'Are you sure you want to delete this habit?',
            confirmSubtext: 'This action cannot be undone.',
            visible: showDeleteConfirm,
            onConfirm: confirmDelete,
            onCancel: cancelDelete,
            loading: isDeleting,
          },
          {
            label: 'Edit',
            color: 'outline',
            onClick: handleEdit,
          },
          {
            label: 'Delete habit',
            color: 'danger',
            onClick: handleDelete,
          },
        ]"
      />
    </template>

    <!-- Nested edit overlay (default slot for drawer context) -->
    <LazyHabitsEditOverlay
      v-if="isEditOverlayMounted"
      v-model:open="isEditOverlayOpen"
      :habit="habit"
      @after:leave="handleEditOverlayAfterLeave"
    />
  </CommonOverlay>
</template>
