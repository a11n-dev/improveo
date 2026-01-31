<script setup lang="ts">
import type { Habit } from "~/types/habit";

interface Props {
  habit: Habit;
}

const { habit } = defineProps<Props>();

/** Format streak goal for display (e.g., "3 / week") */
const streakGoalLabel = computed(() => {
  if (!habit.streak) return "No goal";
  const intervalMap: Record<string, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
  };
  const interval = intervalMap[habit.streak.interval] || habit.streak.interval;
  return `${habit.streak.count} / ${interval}`;
});
</script>

<template>
  <div
    class="flex flex-col gap-1 rounded-lg px-4 py-3"
    :style="{ backgroundColor: `${habit.color}15` }"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-flame"
          class="size-5"
          :style="{ color: habit.color }"
        />
        <span class="text-lg font-semibold text-highlighted">
          {{ habit.currentStreakCount }}
        </span>
      </div>
      <span class="text-sm text-muted">
        {{ streakGoalLabel }}
      </span>
    </div>
    <span class="text-xs text-muted">
      Longest: {{ habit.bestStreakCount }} (26 Jul 2022 - 14 Aug 2022)
    </span>
  </div>
</template>
