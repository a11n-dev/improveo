<script setup lang="ts">
interface Props {
  isTodayCompleted: boolean;
  todayOpacity?: number;
  /** Current streak count (only shown if streakInterval is set) */
  currentStreak?: number;
  /** Whether streak tracking is enabled */
  hasStreak?: boolean;
  /** Streak goal label (e.g., "Daily", "3 / week") */
  streakGoalLabel?: string;
}

const {
  isTodayCompleted,
  todayOpacity = 0.45,
  currentStreak = 0,
  hasStreak = false,
  streakGoalLabel = "",
} = defineProps<Props>();

const badgeStyle = {
  backgroundColor: "color-mix(in srgb, var(--habit-color) 16%, transparent)",
  borderColor: "color-mix(in srgb, var(--habit-color) 35%, transparent)",
  color: "var(--habit-color)",
};
</script>

<template>
  <div class="flex items-center justify-between text-xs text-muted">
    <!-- Left: Streak info (only if streak tracking is enabled) -->
    <div v-if="hasStreak" class="flex items-center gap-1">
      <UBadge
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-lucide-flame"
        class="border"
        :style="badgeStyle"
        :ui="{ leadingIcon: 'text-current' }"
      >
        {{ currentStreak }}
      </UBadge>
      <UBadge
        color="neutral"
        variant="soft"
        size="sm"
        class="border"
        :style="badgeStyle"
      >
        {{ streakGoalLabel }}
      </UBadge>
    </div>
    <div v-else>
      <UBadge
        color="neutral"
        variant="soft"
        size="sm"
        class="border"
        :style="badgeStyle"
      >
        No goal
      </UBadge>
    </div>

    <!-- Right: Legend items -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1">
          <div class="size-3 rounded-xs bg-(--habit-color) opacity-[0.15]" />
          <div class="size-3 rounded-xs bg-(--habit-color)" />
        </div>
        <span>Completion</span>
      </div>

      <div class="flex items-center gap-1">
        <div
          class="relative size-3 rounded-xs bg-(--habit-color)"
          :style="isTodayCompleted ? undefined : { opacity: todayOpacity }"
        >
          <span
            class="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-default"
          />
        </div>
        <span>Today</span>
      </div>
    </div>
  </div>
</template>
