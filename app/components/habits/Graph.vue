<script setup lang="ts">
import { useElementSize } from "@vueuse/core";

interface Props {
  /** Hex color for completed days */
  color: string;
  /** Completion map: date (YYYY-MM-DD) -> completed */
  completions: Record<string, boolean>;
  /** Week start day */
  weekStart?: "mon" | "sun";
  /** End date (defaults to today) */
  endDate?: Date;
  /** Number of days to display (defaults to 365) */
  daysCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  weekStart: "mon",
  endDate: () => new Date(),
  daysCount: 365,
});

/** Build grid data */
const weeks = computed(() =>
  buildContributionGrid({
    endDate: props.endDate,
    daysCount: props.daysCount,
    weekStart: props.weekStart,
    completions: props.completions,
  }),
);

/** Month labels for header */
const monthLabels = computed(() => getMonthLabels(weeks.value));

const monthLabelByWeekIndex = computed(() => {
  const map: Record<number, string> = {};
  for (const label of monthLabels.value) {
    map[label.colIndex] = label.month;
  }
  return map;
});

/** Day labels - only show Tue, Thu, Sat based on week start */
const dayLabels = computed(() => {
  const labels = ["", "", "", "", "", "", ""];
  if (props.weekStart === "mon") {
    labels[1] = "Tue";
    labels[3] = "Thu";
    labels[5] = "Sat";
  } else {
    labels[2] = "Tue";
    labels[4] = "Thu";
    labels[6] = "Sat";
  }
  return labels;
});

/** Scroll container ref */
const scrollContainerRef = ref<HTMLElement | null>(null);

/** Track container size for responsive behavior */
const { width: containerWidth } = useElementSize(scrollContainerRef);

/** Scroll to right (current month) on mount and when container resizes */
const scrollToEnd = () => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.scrollLeft = scrollContainerRef.value.scrollWidth;
  }
};

onMounted(() => {
  nextTick(scrollToEnd);
});

watch(containerWidth, () => {
  nextTick(scrollToEnd);
});
</script>

<template>
  <div class="flex w-full gap-1" :style="{ '--habit-color': color }">
    <!-- Fixed day labels column (pinned Y-axis) -->
    <div class="flex w-7 shrink-0 flex-col gap-1">
      <!-- Spacer for month labels row -->
      <div class="h-4" />
      <!-- Day labels: 7 rows, each 12px with 3px gap = 7*12 + 6*3 = 102px -->
      <div class="flex h-25.5 flex-col justify-between">
        <span
          v-for="(label, index) in dayLabels"
          :key="index"
          class="h-3 text-xs leading-3 text-muted"
        >
          {{ label }}
        </span>
      </div>
    </div>

    <!-- Scrollable area (month labels + grid) -->
    <div
      ref="scrollContainerRef"
      class="no-scrollbar min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
    >
      <div class="inline-flex flex-col gap-1">
        <!-- Month labels row -->
        <div class="flex gap-0.75">
          <span
            v-for="(_, weekIndex) in weeks"
            :key="weekIndex"
            class="h-4 w-3 shrink-0 text-xs text-muted"
          >
            {{ monthLabelByWeekIndex[weekIndex] ?? "" }}
          </span>
        </div>

        <!-- Grid of cells -->
        <div class="grid grid-flow-col grid-rows-7 gap-0.75">
          <template v-for="(week, weekIndex) in weeks" :key="weekIndex">
            <UTooltip
              v-for="day in week"
              :key="day.date"
              :text="day.inRange ? formatDateDisplay(day.date) : ''"
              :delay-duration="0"
              :disabled="!day.inRange"
              :content="{ side: 'top' }"
            >
              <div
                class="size-3 rounded-xs bg-(--habit-color)"
                :class="day.completed ? '' : 'opacity-[0.15]'"
              />
            </UTooltip>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
