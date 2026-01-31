/**
 * Get the date N days ago from a reference date.
 */
export const daysAgo = (days: number, from: Date = new Date()): Date => {
  const result = new Date(from);
  result.setDate(result.getDate() - days);
  return result;
};
