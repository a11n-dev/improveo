const HABITS_KEY = "habits";

type HabitsCacheUpdater = (current: HabitsListResponse) => HabitsListResponse;

/**
 * Pinia store for habit mutations and cache selectors.
 *
 * Data fetching remains in the page layer via `useAsyncData("habits", ...)`.
 * This store reads and mutates the keyed async-data cache through `useNuxtData`.
 */
export const useHabitsStore = defineStore("habits", () => {
  const { notifyMessage } = useNotify();
  const { data: habitsData } = useNuxtData<HabitsListResponse>(HABITS_KEY);

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
        habits: current.habits.map((habit) =>
          habit.id === habitId ? updated : habit,
        ),
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

    patchHabitsCache((current) => ({
      ...current,
      habits: current.habits.map((entry) => {
        if (entry.id !== habitId) {
          return entry;
        }

        if (newCompleted) {
          return {
            ...entry,
            completions: { ...entry.completions, [date]: true },
          };
        }

        const { [date]: _removed, ...rest } = entry.completions;

        return {
          ...entry,
          completions: rest,
        };
      }),
    }));

    try {
      let response: CompletionToggleResponse;

      if (newCompleted) {
        response = await $fetch<CompletionToggleResponse>(
          `/api/habits/${habitId}/completions`,
          {
            method: "POST",
            body: { date },
          },
        );
      } else {
        response = await $fetch<CompletionToggleResponse>(
          `/api/habits/${habitId}/completions?date=${date}`,
          {
            method: "DELETE",
          },
        );
      }

      patchHabitsCache((current) => ({
        ...current,
        habits: current.habits.map((entry) =>
          entry.id === habitId
            ? {
                ...entry,
                currentStreak: response.currentStreak,
                bestStreak: response.bestStreak,
              }
            : entry,
        ),
      }));

      return true;
    } catch {
      patchHabitsCache((current) => ({
        ...current,
        habits: current.habits.map((entry) => {
          if (entry.id !== habitId) {
            return entry;
          }

          if (wasCompleted) {
            return {
              ...entry,
              completions: { ...entry.completions, [date]: true },
            };
          }

          const { [date]: _removed, ...rest } = entry.completions;

          return {
            ...entry,
            completions: rest,
          };
        }),
      }));

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
