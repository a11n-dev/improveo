/**
 * Composable for managing habits state with optimistic updates.
 * Uses useAsyncData for SSR-friendly data fetching and useNuxtData for cache mutations.
 */

const HABITS_KEY = "habits";

export const useHabits = () => {
  const { notifyError } = useToastNotify();

  // Main data fetcher
  const { data, status, error, refresh } = useAsyncData<HabitsListResponse>(
    HABITS_KEY,
    () => $fetch<HabitsListResponse>("/api/habits"),
    {
      default: () => ({ habits: [], weekStart: 0 as WeekStartDay }),
    },
  );

  // Computed helpers
  const habits = computed(() => data.value?.habits ?? []);
  const weekStart = computed(
    () => data.value?.weekStart ?? (0 as WeekStartDay),
  );
  const pending = computed(() => status.value === "pending");

  /**
   * Get cached data for optimistic updates.
   * Ensures habits array exists before returning.
   */
  const getCachedData = () => {
    const { data: cachedData } = useNuxtData<HabitsListResponse>(HABITS_KEY);
    return cachedData;
  };

  /**
   * Helper to safely get habits array from cached data
   */
  const getHabitsFromCache = (
    cachedData: Ref<HabitsListResponse | undefined>,
  ): Habit[] => {
    return cachedData.value?.habits ?? [];
  };

  /**
   * Create a new habit.
   */
  const createHabit = async (
    payload: HabitCreatePayload,
  ): Promise<Habit | null> => {
    const cachedData = getCachedData();

    try {
      const created = await $fetch<Habit>("/api/habits", {
        method: "POST",
        body: payload,
      });

      // Add to cache after successful creation
      if (cachedData.value) {
        cachedData.value = {
          ...cachedData.value,
          habits: [...getHabitsFromCache(cachedData), created],
        };
      }

      return created;
    } catch (err) {
      notifyError("Failed to create habit", "Please try again.");
      return null;
    }
  };

  /**
   * Delete a habit.
   */
  const deleteHabit = async (habitId: string): Promise<boolean> => {
    const cachedData = getCachedData();

    try {
      await $fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      // Remove from cache after successful deletion
      if (cachedData.value) {
        cachedData.value = {
          ...cachedData.value,
          habits: getHabitsFromCache(cachedData).filter(
            (h) => h.id !== habitId,
          ),
        };
      }

      return true;
    } catch (err) {
      notifyError("Failed to delete habit", "Please try again.");
      return false;
    }
  };

  /**
   * Toggle a completion for a habit with optimistic update.
   */
  const toggleCompletion = async (
    habitId: string,
    date: string,
  ): Promise<boolean> => {
    const cachedData = getCachedData();
    const currentHabits = getHabitsFromCache(cachedData);
    const habit = currentHabits.find((h) => h.id === habitId);

    if (!habit) {
      notifyError("Habit not found", "Could not find the habit.");
      return false;
    }

    const wasCompleted = habit.completions[date] ?? false;
    const newCompleted = !wasCompleted;

    // Optimistic: update completion state immediately
    if (cachedData.value) {
      cachedData.value = {
        ...cachedData.value,
        habits: currentHabits.map((h) => {
          if (h.id !== habitId) return h;
          const newCompletions = { ...h.completions };
          if (newCompleted) {
            newCompletions[date] = true;
          } else {
            delete newCompletions[date];
          }
          return { ...h, completions: newCompletions };
        }),
      };
    }

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

      // Update streak values from server response
      if (cachedData.value) {
        cachedData.value = {
          ...cachedData.value,
          habits: getHabitsFromCache(cachedData).map((h) => {
            if (h.id !== habitId) return h;
            return {
              ...h,
              currentStreak: response.currentStreak,
              bestStreak: response.bestStreak,
              lastCompletedOn: response.lastCompletedOn,
            };
          }),
        };
      }

      return true;
    } catch (err) {
      // Revert: restore previous completion state
      if (cachedData.value) {
        cachedData.value = {
          ...cachedData.value,
          habits: getHabitsFromCache(cachedData).map((h) => {
            if (h.id !== habitId) return h;
            const newCompletions = { ...h.completions };
            if (wasCompleted) {
              newCompletions[date] = true;
            } else {
              delete newCompletions[date];
            }
            return { ...h, completions: newCompletions };
          }),
        };
      }
      notifyError("Failed to update completion", "Please try again.");
      return false;
    }
  };

  /**
   * Get a single habit by ID.
   */
  const getHabitById = (habitId: string): Habit | undefined => {
    return habits.value.find((h) => h.id === habitId);
  };

  return {
    // State
    habits,
    weekStart,
    pending,
    error,

    // Actions
    refresh,
    createHabit,
    deleteHabit,
    toggleCompletion,
    getHabitById,
  };
};
