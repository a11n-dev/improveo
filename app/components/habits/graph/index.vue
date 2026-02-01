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
  /** Show legend below the graph */
  showLegend?: boolean;
  /** Show totals below the graph */
  showTotals?: boolean;
  /** Opacity for today's cell (0-1) */
  todayOpacity?: number;
  /** Show tooltips on hover */
  showTooltips?: boolean;
}

const {
  color,
  completions,
  weekStart = "mon",
  endDate = new Date(),
  daysCount = 365,
  showLegend = true,
  showTotals = true,
  todayOpacity = 0.45,
  showTooltips = true,
} = defineProps<Props>();

/** Today's date in ISO format for comparison */
const todayStr = computed(() => formatDate(endDate));

const isTodayCompleted = computed(() => completions[todayStr.value] ?? false);

/** Build grid data */
const weeks = computed(() =>
  buildContributionGrid({
    endDate,
    daysCount,
    weekStart,
    completions,
  }),
);

/** Count total completed days */
const totalCompleted = computed(() => {
  let count = 0;
  for (const week of weeks.value) {
    for (const day of week) {
      if (day.inRange && day.completed) count++;
    }
  }
  return count;
});

/** Month labels for header */
const monthLabels = computed(() => getMonthLabels(weeks.value));

const monthLabelByWeekIndex = computed(() => {
  const map: Record<number, string> = {};
  for (const label of monthLabels.value) {
    map[label.colIndex] = label.month;
  }
  return map;
});

const tooltipOpen = ref(false);
const tooltipAnchor = ref<HTMLElement>();
const tooltipText = ref("");

const handleCellEnter = (event: MouseEvent, date: string) => {
  if (!showTooltips) {
    return;
  }
  const formatted = formatDateWithWeekday(date);
  if (tooltipOpen.value && tooltipText.value === formatted) {
    tooltipAnchor.value = event.currentTarget as HTMLElement;
    return;
  }
  tooltipAnchor.value = event.currentTarget as HTMLElement;
  tooltipText.value = formatted;
  tooltipOpen.value = true;
};

const handleCellLeave = () => {
  tooltipOpen.value = false;
};

const handleGraphScroll = () => {
  tooltipOpen.value = false;
  tooltipAnchor.value = undefined;
};

watch(
  () => showTooltips,
  (enabled) => {
    if (!enabled) {
      tooltipOpen.value = false;
      tooltipAnchor.value = undefined;
    }
  },
);

/** Day labels - only show Tue, Thu, Sat based on week start */
const dayLabels = computed(() => {
  const labels = ["", "", "", "", "", "", ""];
  if (weekStart === "mon") {
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
  <div class="flex w-full flex-col gap-2" :style="{ '--habit-color': color }">
    <UTooltip
      v-if="showTooltips"
      :open="tooltipOpen"
      :reference="tooltipAnchor"
      :text="tooltipText"
      :delay-duration="0"
      :content="{ side: 'top' }"
    />
    <!-- Graph area -->
    <div class="flex w-full gap-1">
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
        @scroll="handleGraphScroll"
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
          <div
            class="grid grid-flow-col grid-rows-7 gap-0.75"
            v-memo="[weeks, todayOpacity]"
          >
            <template v-for="(week, weekIndex) in weeks" :key="weekIndex">
              <div
                v-for="day in week"
                :key="day.date"
                class="relative size-3 rounded-xs bg-(--habit-color)"
                :class="day.inRange && day.completed ? '' : 'opacity-[0.15]'"
                :style="
                  day.date === todayStr && !day.completed
                    ? { opacity: todayOpacity }
                    : undefined
                "
                @mouseenter="handleCellEnter($event, day.date)"
                @mouseleave="handleCellLeave"
              >
                <span
                  v-if="day.date === todayStr"
                  class="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-default"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <HabitsGraphLegend
      :total-completed="totalCompleted"
      :is-today-completed="isTodayCompleted"
      :today-opacity="todayOpacity"
      :show-legend="showLegend"
      :show-totals="showTotals"
    />
  </div>
</template>
