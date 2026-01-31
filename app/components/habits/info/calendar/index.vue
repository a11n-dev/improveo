<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import type { Habit } from "~/types/habit";

import {
  CalendarDate,
  getLocalTimeZone,
  today as getToday,
} from "@internationalized/date";

interface Props {
  habit: Habit;
  open?: boolean;
}

const { habit, open = true } = defineProps<Props>();

const emit = defineEmits<{
  "toggle-date": [date: string];
}>();

/** Today's CalendarDate for max constraint */
const todayDate = getToday(getLocalTimeZone());

/** Current calendar placeholder (controls which month is displayed) */
const placeholder = ref<CalendarDate>(todayDate);

/** Convert completions to CalendarDate array for v-model */
const selectedDates = computed(() => {
  const dates: CalendarDate[] = [];
  for (const [dateStr, completed] of Object.entries(habit.completions)) {
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

const isOpen = computed(() => open);

/** Sync local dates when habit changes or overlay opens */
watch(
  [() => habit.completions, isOpen],
  () => {
    if (isOpen.value) {
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
</script>

<template>
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

    <HabitsInfoCalendarControls
      :month-year-label="monthYearLabel"
      :is-next-disabled="isNextDisabled"
      @prev="prevMonth"
      @next="nextMonth"
      @today="goToToday"
    />
  </div>
</template>
