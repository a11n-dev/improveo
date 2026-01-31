<script setup lang="ts">
interface Props {
  totalCompleted: number;
  isTodayCompleted: boolean;
  todayOpacity?: number;
  showLegend?: boolean;
  showTotals?: boolean;
}

const {
  totalCompleted,
  isTodayCompleted,
  todayOpacity = 0.45,
  showLegend = true,
  showTotals = true,
} = defineProps<Props>();
</script>

<template>
  <div
    v-if="showLegend || showTotals"
    class="flex items-center justify-between text-xs text-muted"
  >
    <div v-if="showTotals">{{ totalCompleted }} completed</div>
    <div v-else />

    <div v-if="showLegend" class="flex items-center gap-3">
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
