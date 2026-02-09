<script setup lang="ts">
interface Props {
  habit: Habit;
  weekStart?: WeekStartDay;
  completed?: boolean;
}

const { habit, weekStart = 0, completed = false } = defineProps<Props>();

const emit = defineEmits<{
  "update:completed": [value: boolean];
  info: [];
}>();

/** Local checked state synced with prop */
const isChecked = computed({
  get: () => completed,
  set: (value: boolean) => emit("update:completed", value),
});

/** Goal label for legend */
const goalLabel = computed(() =>
  formatGoalLabel(habit.goal?.periodType, habit.goal?.targetCount),
);

/** Handle card click */
const handleInfoClick = () => {
  emit("info");
};

/** Handle checkbox click (stop propagation to prevent double toggle) */
const handleCheckboxClick = (event: Event) => {
  event.stopPropagation();
};
</script>

<template>
  <UCard
    variant="subtle"
    class="shrink-0 cursor-pointer transition-shadow hover:shadow-md"
    @click="handleInfoClick"
  >
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <!-- Left: Icon + Title/Description -->
        <div class="flex min-w-0 items-center gap-3">
          <!-- Icon circle with habit color -->
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-lg"
            :style="{ backgroundColor: `${habit.color}20` }"
          >
            <UIcon
              :name="habit.icon"
              class="size-5"
              :style="{ color: habit.color }"
            />
          </div>

          <!-- Title + Description -->
          <div class="flex min-w-0 flex-col">
            <span class="truncate font-medium">
              {{ habit.title }}
            </span>
            <span class="truncate text-sm text-muted">
              {{ habit.description || "No description" }}
            </span>
          </div>
        </div>

        <!-- Right: Checkbox -->
        <div class="flex shrink-0 items-center gap-2">
          <!-- Checkbox (larger size) -->
          <div class="relative" @click="handleCheckboxClick">
            <UCheckbox
              v-model="isChecked"
              :style="{
                '--habit-color-dimmed': `${habit.color}20`,
                '--habit-color': habit.color,
              }"
              :color="isChecked ? 'success' : 'neutral'"
              :ui="{
                base: `size-10 rounded-lg bg-(--habit-color-dimmed)`,
                icon: 'size-5',
                indicator: `bg-(--habit-color)`,
              }"
            />
            <UIcon
              v-if="!isChecked"
              name="i-lucide-check"
              class="pointer-events-none absolute inset-0 m-auto size-5 text-muted"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Body: Contribution graph -->
    <HabitsGraph
      :color="habit.color"
      :completions="habit.completions"
      :week-start="weekStart"
      :current-streak="habit.currentStreak"
      :best-streak="habit.bestStreak"
      :has-goal="habit.goal !== null"
      :goal-label="goalLabel"
    />
  </UCard>
</template>
