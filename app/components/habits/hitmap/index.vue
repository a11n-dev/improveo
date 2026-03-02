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
  hasGoal?: boolean;
  goalLabel?: string;
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
  hasGoal = false,
  goalLabel = "",
} = defineProps<Props>();

/** Whether viewport is desktop-sized (tooltips disabled on mobile). */
const isDesktop = useIsDesktop();

const tooltipOpen = ref(false);
const tooltipAnchor = ref<HTMLElement>();
const tooltipText = ref("");

/** Today's date string used to hide future cells. */
const todayStr = computed(() => formatHitmapDate(endDate));

/** Weekly hitmap matrix generated from completion data. */
const weeks = computed(() =>
  buildHabitHitmap({
    endDate,
    daysCount,
    weekStart,
    completions,
  }),
);

/** Month labels rendered on top of each matching week column. */
const monthLabels = computed(() => getHitmapMonthLabels(weeks.value));

/** Fast lookup map for month labels by week index. */
const monthLabelByWeekIndex = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {};

  for (const label of monthLabels.value) {
    map[label.colIndex] = label.month;
  }

  return map;
});

/** Day labels rendered on the y-axis according to week start. */
const dayLabels = computed(() => getDayLabelsForHitmap(weekStart));

watch(
  () => showTooltips,
  (enabled) => {
    if (!enabled) {
      tooltipOpen.value = false;
      tooltipAnchor.value = undefined;
    }
  },
);

/** Opens tooltip for the hovered day cell when tooltips are enabled. */
const handleCellEnter = (event: MouseEvent, date: string): void => {
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

/** Closes tooltip when a cell loses hover state. */
const handleCellLeave = (): void => {
  tooltipOpen.value = false;
};

/** Closes tooltip while the horizontal hitmap region scrolls. */
const handleHitmapScroll = (): void => {
  tooltipOpen.value = false;
  tooltipAnchor.value = undefined;
};
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

    <!-- Hitmap area -->
    <div class="flex w-full" :class="showAxes ? 'gap-1' : ''">
      <!-- Fixed day labels column (pinned Y-axis) -->
      <div v-if="showAxes" class="flex w-7 shrink-0 flex-col gap-1">
        <div class="h-5.25" />

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

      <!-- Scrollable area (month labels + cell grid) -->
      <div
        class="no-scrollbar min-w-0 flex-1 overflow-x-auto overflow-y-hidden [direction:rtl]"
        @scroll="handleHitmapScroll"
      >
        <div
          class="inline-flex flex-col [direction:ltr]"
          :class="showAxes ? 'gap-1' : ''"
        >
          <div v-if="showAxes" class="flex gap-0.75">
            <span
              v-for="(_, weekIndex) in weeks"
              :key="weekIndex"
              class="h-4 w-3 shrink-0 text-xs text-muted"
            >
              {{ monthLabelByWeekIndex[weekIndex] ?? "" }}
            </span>
          </div>

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

    <HabitsHitmapLegend
      v-if="showLegend"
      :current-streak="currentStreak"
      :best-streak="bestStreak"
      :has-goal="hasGoal"
      :goal-label="goalLabel"
    />
  </div>
</template>
