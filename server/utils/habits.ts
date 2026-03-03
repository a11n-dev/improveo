import type {
  CompletionBitmapRow,
  CompletionToggleComputationOptions,
  DbClient,
  GoalVersionRow,
  HabitMetadataRow,
  HabitRange,
  HabitStreak,
} from "~~/server/types/habit";

/**
 * Returns the default habits API date range.
 * The window includes today and the previous 364 days.
 */
export const getDefaultHabitRange = (endDate = new Date()): HabitRange => {
  const toDate = new Date(endDate);
  const fromDate = new Date(endDate);
  fromDate.setDate(fromDate.getDate() - 364);

  return {
    fromStr: toISODateString(fromDate),
    toStr: toISODateString(toDate),
  };
};

/**
 * Resolves an explicit date range from query params with safe defaults.
 */
export const getHabitRangeFromQuery = (
  query: Record<string, unknown>,
): HabitRange => {
  const defaults = getDefaultHabitRange();

  return {
    fromStr: typeof query.from === "string" ? query.from : defaults.fromStr,
    toStr: typeof query.to === "string" ? query.to : defaults.toStr,
  };
};

/**
 * Returns all calendar years covered by an inclusive date range.
 */
export const getYearsInRange = (fromStr: string, toStr: string): number[] => {
  const fromDate = parseISODateString(fromStr);
  const toDate = parseISODateString(toStr);
  const years: number[] = [];

  for (
    let year = fromDate.getFullYear();
    year <= toDate.getFullYear();
    year++
  ) {
    years.push(year);
  }

  return years;
};

/** Maps an active goal row from database shape to shared DTO shape. */
export const mapGoalVersionRowToDto = (
  row: GoalVersionRow,
): HabitGoalVersion => {
  return {
    id: row.id,
    periodType: row.period_type,
    targetCount: row.target_count,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
  };
};

/**
 * Creates a full Habit DTO from database metadata and computed values.
 */
export const mapHabitRowToDto = (
  row: HabitMetadataRow,
  goal: HabitGoalVersion | null,
  completions: Record<string, boolean>,
  streak: HabitStreak,
): Habit => {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    color: row.color,
    goal,
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    completions,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
};

/**
 * Validates that a habit exists and belongs to the authenticated user.
 * Throws 404 when ownership does not match.
 */
export const assertHabitOwnership = async (
  client: DbClient,
  habitId: string,
  userId: string,
): Promise<void> => {
  const { data, error } = await client
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw createError({ statusCode: 404, message: "Habit not found" });
  }
};

/**
 * Fetches a habit metadata row owned by the authenticated user.
 */
export const fetchHabitMetadata = async (
  client: DbClient,
  habitId: string,
  userId: string,
): Promise<HabitMetadataRow> => {
  const { data, error } = await client
    .from("habits")
    .select("id, title, description, icon, color, created_at")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw createError({ statusCode: 404, message: "Habit not found" });
  }

  return data;
};

/**
 * Fetches the active goal version for a habit.
 * Returns null when no active goal exists.
 */
export const fetchActiveGoalVersion = async (
  client: DbClient,
  habitId: string,
): Promise<HabitGoalVersion | null> => {
  const { data, error } = await client
    .from("habit_goal_versions")
    .select("id, period_type, target_count, effective_from, effective_to")
    .eq("habit_id", habitId)
    .is("effective_to", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGoalVersionRowToDto(data as GoalVersionRow);
};

/**
 * Fetches completion bitmap rows for a habit.
 * When `years` is provided, rows are restricted to that list.
 */
export const fetchCompletionRows = async (
  client: DbClient,
  habitId: string,
  years?: number[],
): Promise<CompletionBitmapRow[]> => {
  if (years && years.length === 0) {
    return [];
  }

  let query = client
    .from("completions")
    .select("year, bitmap, week_counts, month_counts")
    .eq("habit_id", habitId);

  if (years && years.length > 0) {
    query = query.in("year", years);
  }

  const { data } = await query;
  const rows = (data ?? []) as CompletionBitmapRow[];

  return rows;
};

/**
 * Decodes completion bitmaps into a date-keyed completion map.
 */
export const decodeCompletionsFromRows = (
  rows: CompletionBitmapRow[],
  fromStr: string,
  toStr: string,
): Record<string, boolean> => {
  const completions: Record<string, boolean> = {};

  for (const row of rows) {
    Object.assign(
      completions,
      decodeBitmapToCompletionMap(row.bitmap, row.year, fromStr, toStr),
    );
  }

  return completions;
};

/**
 * Computes habit streak values for a goal and completion row set.
 */
export const computeHabitStreak = (
  goal: HabitGoalVersion | null,
  rows: CompletionBitmapRow[],
  weekStart: WeekStartDay,
): HabitStreak => {
  if (!goal) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  return computeStreaks(
    rows,
    {
      periodType: goal.periodType,
      targetCount: goal.targetCount,
    },
    weekStart,
  );
};

/**
 * Persists a completion toggle via RPC and returns updated streak values.
 */
export const setHabitCompletionAndComputeStreak = async (
  client: DbClient,
  options: CompletionToggleComputationOptions,
): Promise<CompletionToggleResponse> => {
  const { habitId, date, completed, weekStart } = options;

  const { error: updateError } = await client.rpc("set_habit_completion", {
    p_habit_id: habitId,
    p_date: date,
    p_value: completed ? 1 : 0,
    p_week_start: weekStart,
  });

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: completed
        ? "Failed to add completion"
        : "Failed to delete completion",
    });
  }

  const goal = await fetchActiveGoalVersion(client, habitId);

  if (!goal) {
    return { completed, currentStreak: 0, bestStreak: 0 };
  }

  const rows = await fetchCompletionRows(client, habitId);
  const streak = computeHabitStreak(goal, rows, weekStart);

  return {
    completed,
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
  };
};
