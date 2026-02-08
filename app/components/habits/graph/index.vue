<script setup lang="ts">
interface Props {
  color: string;
  completions: Record<string, boolean>;
  weekStart?: WeekStartDay;
  endDate?: Date;
  daysCount?: number;
  showLegend?: boolean;
  showAxes?: boolean;
  showTooltips?: boolean;
  currentStreak?: number;
  bestStreak?: number;
  hasStreak?: boolean;
  streakGoalLabel?: string;
}

const {
  color,
  completions,
  weekStart = 0,
  endDate = new Date(),
  daysCount = 365,
  showLegend = true,
  showAxes = true,
  showTooltips = true,
  currentStreak = 0,
  bestStreak = 0,
  hasStreak = false,
  streakGoalLabel = "",
} = defineProps<Props>();

/** Whether on desktop viewport (used to disable tooltips on mobile) */
const isDesktop = useIsDesktop();

/** Today's date in ISO format for comparison */
const todayStr = computed(() => formatDate(endDate));

/** Build grid data */
const weeks = computed(() =>
  buildContributionGrid({
    endDate,
    daysCount,
    weekStart,
    completions,
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

const tooltipOpen = ref(false);
const tooltipAnchor = ref<HTMLElement>();
const tooltipText = ref("");

const handleCellEnter = (event: MouseEvent, date: string) => {
  if (!showTooltips || !isDesktop.value) {
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

/** Day labels based on week start */
const dayLabels = computed(() => getDayLabelsForGraph(weekStart));
</script>

<template>
  <div class="flex w-full flex-col gap-2" :style="{ '--habit-color': color }">
    <ClientOnly>
      <UTooltip
        v-if="showTooltips && isDesktop"
        :open="tooltipOpen"
        :reference="tooltipAnchor"
        :text="tooltipText"
        :delay-duration="0"
        :content="{ side: 'top', sideOffset: 6 }"
      />
      <template #fallback />
    </ClientOnly>

    <!-- Graph area -->
    <div class="flex w-full" :class="showAxes ? 'gap-1' : ''">
      <!-- Fixed day labels column (pinned Y-axis) -->
      <div v-if="showAxes" class="flex w-7 shrink-0 flex-col gap-1">
        <!-- Spacer for month labels row -->
        <div class="h-5.25" />
        <!-- Day labels -->
        <div class="grid grid-rows-7 gap-0.75">
          <span
            v-for="(label, index) in dayLabels"
            :key="index"
            class="flex h-3 items-center text-xs leading-none text-muted"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <!-- Scrollable area (month labels + grid) -->
      <div
        class="no-scrollbar min-w-0 flex-1 overflow-x-auto overflow-y-hidden [direction:rtl]"
        @scroll="handleGraphScroll"
      >
        <div
          class="inline-flex flex-col [direction:ltr]"
          :class="showAxes ? 'gap-1' : ''"
        >
          <!-- Month labels row -->
          <div v-if="showAxes" class="flex gap-0.75">
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
              <div
                v-for="day in week"
                v-show="day.date <= todayStr"
                :key="day.date"
                class="size-3 rounded-xs bg-(--habit-color)"
                :class="day.inRange && day.completed ? '' : 'opacity-[0.15]'"
                @mouseenter="handleCellEnter($event, day.date)"
                @mouseleave="handleCellLeave"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <HabitsGraphLegend
      v-if="showLegend"
      :current-streak="currentStreak"
      :best-streak="bestStreak"
      :has-streak="hasStreak"
      :streak-goal-label="streakGoalLabel"
    />
  </div>
</template>
