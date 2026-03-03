import { HABITS_CACHE_KEY } from "~~/shared/constants/cache";

/** Immutable cache updater for habits payload. */
type HabitsCacheUpdater = (current: HabitsListResponse) => HabitsListResponse;

/** Updates a single habit in an array while preserving order. */
const updateHabitById = (
  habits: Habit[],
  habitId: string,
  updater: (habit: Habit) => Habit,
): Habit[] => {
  return habits.map((habit) => (habit.id === habitId ? updater(habit) : habit));
};

/** Returns habit copy with completion state toggled for a given date. */
const withCompletionState = (
  habit: Habit,
  date: string,
  completed: boolean,
): Habit => {
  if (completed) {
    return {
      ...habit,
      completions: { ...habit.completions, [date]: true },
    };
  }

  const { [date]: _removed, ...rest } = habit.completions;

  return {
    ...habit,
    completions: rest,
  };
};

/**
 * Pinia store for habit mutations and cache selectors.
 *
 * Data fetching remains in the page layer via `useAsyncData(HABITS_CACHE_KEY, ...)`.
 * This store reads and mutates the keyed async-data cache through `useNuxtData`.
 */
export const useHabitsStore = defineStore("habits", () => {
  const { notifyMessage } = useNotify();
  const { data: habitsData } =
    useNuxtData<HabitsListResponse>(HABITS_CACHE_KEY);

  /** Current habits list from async-data cache. */
  const habits = computed<Habit[]>(() => habitsData.value?.habits ?? []);

  /** Current week-start preference from async-data cache. */
  const weekStart = computed<WeekStartDay>(
    () => habitsData.value?.weekStart ?? (0 as WeekStartDay),
  );

  /** Applies immutable updates to the cached habits payload when available. */
  const patchHabitsCache = (updater: HabitsCacheUpdater): void => {
    if (!habitsData.value) {
      return;
    }

    habitsData.value = updater(habitsData.value);
  };

  /** Applies a focused immutable update to one habit in cached payload. */
  const patchHabitInCache = (
    habitId: string,
    updater: (habit: Habit) => Habit,
  ): void => {
    patchHabitsCache((current) => ({
      ...current,
      habits: updateHabitById(current.habits, habitId, updater),
    }));
  };

  /** Creates a habit and appends it to cached list when present. */
  const createHabit = async (
    payload: HabitCreatePayload,
  ): Promise<Habit | null> => {
    try {
      const created = await $fetch<Habit>("/api/habits", {
        method: "POST",
        body: payload,
      });

      patchHabitsCache((current) => ({
        ...current,
        habits: [...current.habits, created],
      }));

      return created;
    } catch {
      notifyMessage({ scope: "habits", code: "create_failed" });
      return null;
    }
  };

  /** Deletes a habit and removes it from cache when request succeeds. */
  const deleteHabit = async (habitId: string): Promise<boolean> => {
    try {
      await $fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      patchHabitsCache((current) => ({
        ...current,
        habits: current.habits.filter((habit) => habit.id !== habitId),
      }));

      return true;
    } catch {
      notifyMessage({ scope: "habits", code: "delete_failed" });
      return false;
    }
  };

  /** Updates a habit and replaces it in cache when request succeeds. */
  const updateHabit = async (
    habitId: string,
    payload: HabitUpdatePayload,
  ): Promise<Habit | null> => {
    try {
      const updated = await $fetch<Habit>(`/api/habits/${habitId}`, {
        method: "PATCH",
        body: payload,
      });

      patchHabitsCache((current) => ({
        ...current,
        habits: updateHabitById(current.habits, habitId, () => updated),
      }));

      return updated;
    } catch {
      notifyMessage({ scope: "habits", code: "update_failed" });
      return null;
    }
  };

  /**
   * Toggles completion with optimistic cache update.
   * Reverts local cache if the request fails.
   */
  const toggleCompletion = async (
    habitId: string,
    date: string,
  ): Promise<boolean> => {
    const currentHabits = habitsData.value?.habits ?? [];
    const habit = currentHabits.find((entry) => entry.id === habitId);

    if (!habit) {
      notifyMessage({ scope: "habits", code: "not_found" });
      return false;
    }

    const wasCompleted = habit.completions[date] ?? false;
    const newCompleted = !wasCompleted;

    patchHabitInCache(habitId, (entry) =>
      withCompletionState(entry, date, newCompleted),
    );

    try {
      const response = newCompleted
        ? await $fetch<CompletionToggleResponse>(
            `/api/habits/${habitId}/completions`,
            {
              method: "POST",
              body: { date },
            },
          )
        : await $fetch<CompletionToggleResponse>(
            `/api/habits/${habitId}/completions?date=${date}`,
            {
              method: "DELETE",
            },
          );

      patchHabitInCache(habitId, (entry) => ({
        ...entry,
        currentStreak: response.currentStreak,
        bestStreak: response.bestStreak,
      }));

      return true;
    } catch {
      patchHabitInCache(habitId, (entry) =>
        withCompletionState(entry, date, wasCompleted),
      );

      notifyMessage({ scope: "habits", code: "completion_update_failed" });
      return false;
    }
  };

  /** Returns a single habit by id from cached list. */
  const getHabitById = (habitId: string): Habit | undefined => {
    return habits.value.find((habit) => habit.id === habitId);
  };

  return {
    createHabit,
    deleteHabit,
    getHabitById,
    habits,
    toggleCompletion,
    updateHabit,
    weekStart,
  };
});
