<script setup lang="ts">
interface Props {
  /** Current streak count (only shown when goal tracking is enabled). */
  currentStreak?: number;
  /** Best streak count for the habit. */
  bestStreak?: number;
  /** Indicates whether a goal is configured for the habit. */
  hasGoal?: boolean;
  /** Goal summary label, for example `Daily` or `3 / Week`. */
  goalLabel?: string;
}

const {
  currentStreak = 0,
  bestStreak = 0,
  hasGoal = false,
  goalLabel = "",
} = defineProps<Props>();

const badgeStyle = {
  backgroundColor: "color-mix(in srgb, var(--habit-color) 16%, transparent)",
  borderColor: "color-mix(in srgb, var(--habit-color) 35%, transparent)",
  color: "var(--habit-color)",
};
</script>

<template>
  <div class="flex items-center justify-between text-xs text-muted">
    <div v-if="hasGoal" class="flex items-center gap-1" @click.stop>
      <UTooltip
        text="Current streak"
        :content="{ side: 'top', sideOffset: 6 }"
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
        :content="{ side: 'top', sideOffset: 6 }"
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
        text="Goal"
        :content="{ side: 'top', sideOffset: 6 }"
        :delay-duration="0"
      >
        <UBadge
          color="neutral"
          variant="soft"
          size="sm"
          class="border"
          :style="badgeStyle"
        >
          {{ goalLabel }}
        </UBadge>
      </UTooltip>
    </div>

    <div v-else @click.stop>
      <UTooltip
        text="Goal"
        :content="{ side: 'top', sideOffset: 6 }"
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

    <div class="flex items-center gap-4">
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
