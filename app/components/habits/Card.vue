<script setup lang="ts">
import type { Habit } from "~/types/habit";

interface Props {
  habit: Habit;
  /** Whether the habit is completed for today */
  completed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  completed: false,
});

const emit = defineEmits<{
  "update:completed": [value: boolean];
  info: [];
}>();

/** Local checked state synced with prop */
const isChecked = computed({
  get: () => props.completed,
  set: (value: boolean) => emit("update:completed", value),
});

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
    class="cursor-pointer transition-shadow hover:shadow-md"
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
            <span v-if="habit.description" class="truncate text-sm text-muted">
              {{ habit.description }}
            </span>
          </div>
        </div>

        <!-- Right: Checkbox -->
        <div class="flex shrink-0 items-center gap-2">
          <!-- Checkbox (larger size) -->
          <div class="relative" @click="handleCheckboxClick">
            <UCheckbox
              :style="{
                '--habit-color-dimmed': `${habit.color}20`,
                '--habit-color': habit.color,
              }"
              v-model="isChecked"
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
    <HabitsGraph :color="habit.color" :completions="habit.completions" />
  </UCard>
</template>
