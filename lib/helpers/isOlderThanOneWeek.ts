// lib/helpers/isOlderThanOneWeek.ts

/**
 * Checks if a given date is older than one week from “now.”
 * @param date - The Date object (or date string) to check.
 * @returns boolean indicating if it’s >1 week old.
 */
export function isOlderThanOneWeek(
  date: Date | string | null | undefined
): boolean {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false; // invalid date

  const now = Date.now();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  return dateObj.getTime() <= now - ONE_WEEK_MS;
}
