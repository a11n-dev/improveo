<script setup lang="ts">
interface Props {
  /** Current streak count (only shown if streakInterval is set) */
  currentStreak?: number;
  /** Best streak count */
  bestStreak?: number;
  /** Whether streak tracking is enabled */
  hasStreak?: boolean;
  /** Streak goal label (e.g., "Daily", "3 / week") */
  streakGoalLabel?: string;
}

const {
  currentStreak = 0,
  bestStreak = 0,
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
    <!-- Left: Streak info -->
    <div v-if="hasStreak" class="flex items-center gap-1">
      <UTooltip
        text="Current streak"
        :content="{ side: 'top' }"
        :delay-duration="0"
      >
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
      </UTooltip>
      <UTooltip
        text="Best streak"
        :content="{ side: 'top' }"
        :delay-duration="0"
      >
        <UBadge
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-lucide-trophy"
          class="border"
          :style="badgeStyle"
          :ui="{ leadingIcon: 'text-current' }"
        >
          {{ bestStreak }}
        </UBadge>
      </UTooltip>
      <UTooltip
        text="Streak goal"
        :content="{ side: 'top' }"
        :delay-duration="0"
      >
        <UBadge
          color="neutral"
          variant="soft"
          size="sm"
          class="border"
          :style="badgeStyle"
        >
          {{ streakGoalLabel }}
        </UBadge>
      </UTooltip>
    </div>
    <div v-else>
      <UTooltip
        text="Streak goal"
        :content="{ side: 'top' }"
        :delay-duration="0"
      >
        <UBadge
          color="neutral"
          variant="soft"
          size="sm"
          class="border"
          :style="badgeStyle"
        >
          No goal
        </UBadge>
      </UTooltip>
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
    </div>
  </div>
</template>
