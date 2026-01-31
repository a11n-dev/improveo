<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import type { Habit } from "~/types/habit";

import {
  CalendarDate,
  getLocalTimeZone,
  today as getToday,
} from "@internationalized/date";
import { createReusableTemplate } from "@vueuse/core";

const props = defineProps<{
  habit: Habit;
}>();

const emit = defineEmits<{
  "toggle-date": [date: string];
  edit: [];
}>();

const isDesktop = useIsDesktop();
const open = defineModel<boolean>("open", { default: false });

/** Today's CalendarDate for max constraint */
const todayDate = getToday(getLocalTimeZone());

/** Current calendar placeholder (controls which month is displayed) */
const placeholder = ref<CalendarDate>(todayDate);

/** Convert completions to CalendarDate array for v-model */
const selectedDates = computed(() => {
  const dates: CalendarDate[] = [];
  for (const [dateStr, completed] of Object.entries(props.habit.completions)) {
    if (completed) {
      const [year, month, day] = dateStr.split("-").map(Number);
      if (year && month && day) {
        dates.push(new CalendarDate(year, month, day));
      }
    }
  }
  return dates;
});

/** Local copy of selected dates for calendar interaction */
const localSelectedDates = ref<CalendarDate[]>([]);

/** Sync local dates when habit changes or overlay opens */
watch(
  [() => props.habit.completions, open],
  () => {
    if (open.value) {
      localSelectedDates.value = [...selectedDates.value];
      placeholder.value = todayDate;
    }
  },
  { immediate: true },
);

/** Watch for changes in localSelectedDates and emit toggle events */
watch(
  localSelectedDates,
  (newDates, oldDates) => {
    if (!oldDates) return;

    const oldSet = new Set(oldDates.map((d) => d.toString()));
    const newSet = new Set(newDates.map((d) => d.toString()));

    // Find added dates
    for (const d of newDates) {
      if (!oldSet.has(d.toString())) {
        emit("toggle-date", d.toString());
      }
    }
    // Find removed dates
    for (const d of oldDates) {
      if (!newSet.has(d.toString())) {
        emit("toggle-date", d.toString());
      }
    }
  },
  { deep: true },
);

/** Check if a date is after today (should be disabled) */
const isDateDisabled = (date: DateValue) => {
  return date.compare(todayDate) > 0;
};

/** Navigate to previous month */
const prevMonth = () => {
  placeholder.value = placeholder.value.subtract({ months: 1 });
};

/** Navigate to next month */
const nextMonth = () => {
  const next = placeholder.value.add({ months: 1 });
  // Don't go past current month
  if (
    next.year < todayDate.year ||
    (next.year === todayDate.year && next.month <= todayDate.month)
  ) {
    placeholder.value = next;
  }
};

/** Reset to today's month */
const goToToday = () => {
  placeholder.value = todayDate;
};

/** Check if next month button should be disabled */
const isNextDisabled = computed(() => {
  return (
    placeholder.value.year === todayDate.year &&
    placeholder.value.month === todayDate.month
  );
});

/** Format month/year for display */
const monthYearLabel = computed(() => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[placeholder.value.month - 1]} ${placeholder.value.year}`;
});

/** Handle edit button click */
const handleEdit = () => {
  emit("edit");
};

/** Close overlay */
const handleClose = () => {
  open.value = false;
};

/** Format streak goal for display (e.g., "3 / week") */
const streakGoalLabel = computed(() => {
  if (!props.habit.streak) return "No goal";
  const intervalMap: Record<string, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
  };
  const interval =
    intervalMap[props.habit.streak.interval] || props.habit.streak.interval;
  return `${props.habit.streak.count} / ${interval}`;
});

const [DefineHeaderTemplate, ReuseHeaderTemplate] = createReusableTemplate();
const [DefineBodyTemplate, ReuseBodyTemplate] = createReusableTemplate();
const [DefineFooterTemplate, ReuseFooterTemplate] = createReusableTemplate();
</script>

<template>
  <!-- Define reusable header template -->
  <DefineHeaderTemplate>
    <div class="flex w-full items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <!-- Icon circle with habit color -->
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-lg"
          :style="{ backgroundColor: `${habit.color}20` }"
        >
          <UIcon
            :name="habit.icon"
            class="size-6"
            :style="{ color: habit.color }"
          />
        </div>

        <!-- Title + Description -->
        <div class="flex min-w-0 flex-col">
          <span class="truncate text-lg font-semibold text-highlighted">
            {{ habit.title }}
          </span>
          <span class="truncate text-sm text-muted">
            {{ habit.description || "No Description" }}
          </span>
        </div>
      </div>

      <!-- Close button -->
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        aria-label="Close"
        @click="handleClose"
      />
    </div>
  </DefineHeaderTemplate>

  <!-- Define reusable body template -->
  <DefineBodyTemplate>
    <div
      class="flex flex-col gap-4"
      :style="{
        '--habit-color': habit.color,
        '--habit-color-hover': `color-mix(in srgb, ${habit.color} 70%, white)`,
        '--habit-color-light': `${habit.color}20`,
      }"
    >
      <!-- Graph -->
      <HabitsGraph
        :color="habit.color"
        :completions="habit.completions"
        :show-legend="true"
        :show-totals="true"
      />

      <!-- Streak pill (current + longest) -->
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

      <!-- Calendar -->
      <div class="flex flex-col gap-3">
        <UCalendar
          :model-value="localSelectedDates as DateValue[]"
          :placeholder="placeholder as DateValue"
          multiple
          :month-controls="false"
          :year-controls="false"
          :week-starts-on="1"
          :max-value="todayDate"
          :is-date-disabled="isDateDisabled"
          :ui="{
            heading: 'hidden',
            header: 'hidden',
            headCell: 'text-(--habit-color)',
            cellTrigger: [
              'rounded-md!',
              'hover:bg-(--habit-color-light)!',
              'data-selected:bg-(--habit-color-light)!',
              'data-selected:text-(--habit-color)!',
              'data-selected:hover:bg-(--habit-color-light)!',
              'data-today:font-bold!',
              'data-today:text-(--habit-color)!',
              'data-disabled:bg-transparent!',
              'data-disabled:hover:bg-transparent!',
            ].join(' '),
          }"
          class="w-full"
          @update:model-value="
            (v: unknown) => {
              if (Array.isArray(v))
                localSelectedDates = v.map(
                  (d: DateValue) => new CalendarDate(d.year, d.month, d.day),
                );
            }
          "
          @update:placeholder="
            (v: DateValue) => {
              placeholder = new CalendarDate(v.year, v.month, v.day);
            }
          "
        />

        <!-- Calendar controls -->
        <div class="flex items-center justify-between">
          <!-- Left: Calendar icon + month/year button -->
          <UButton
            color="neutral"
            variant="subtle"
            size="md"
            icon="i-lucide-calendar"
            :label="monthYearLabel"
            @click="goToToday"
          />

          <!-- Right: Prev/Next buttons -->
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="subtle"
              size="md"
              aria-label="Previous month"
              @click="prevMonth"
            />
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="subtle"
              size="md"
              aria-label="Next month"
              :disabled="isNextDisabled"
              @click="nextMonth"
            />
          </div>
        </div>
      </div>
    </div>
  </DefineBodyTemplate>

  <!-- Define reusable footer template -->
  <DefineFooterTemplate>
    <UButton
      label="Edit"
      color="neutral"
      variant="outline"
      block
      class="justify-center"
      @click="handleEdit"
    />
    <UButton
      label="Close"
      color="neutral"
      variant="subtle"
      block
      class="justify-center"
      @click="handleClose"
    />
  </DefineFooterTemplate>

  <!-- Desktop: Modal -->
  <UModal
    v-if="isDesktop"
    v-model:open="open"
    :close="false"
    :ui="{ footer: 'flex-col gap-2' }"
  >
    <template #header>
      <ReuseHeaderTemplate />
    </template>
    <template #body>
      <ReuseBodyTemplate />
    </template>
    <template #footer>
      <ReuseFooterTemplate />
    </template>
  </UModal>

  <!-- Mobile: Drawer -->
  <UDrawer v-else v-model:open="open">
    <template #header>
      <ReuseHeaderTemplate />
    </template>
    <template #body>
      <ReuseBodyTemplate />
    </template>
    <template #footer>
      <ReuseFooterTemplate />
    </template>
  </UDrawer>
</template>
