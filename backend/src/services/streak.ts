import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  cleanupSubmissionVotes,
  cleanupSubmissions,
  reportVerificationVotes,
  reports,
} from '../db/schema.js';

/** Calendar date in UTC (YYYY-MM-DD). Streaks use UTC midnight boundaries. */
export function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toUtcDateString(d);
}

/**
 * Consecutive active UTC days ending today (if active today) or yesterday (if not active today).
 */
export function computeCurrentStreak(activeDates: Set<string>, now = new Date()): number {
  const today = toUtcDateString(now);
  const yesterday = addUtcDays(today, -1);

  let cursor: string | null = null;
  if (activeDates.has(today)) cursor = today;
  else if (activeDates.has(yesterday)) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (cursor !== null && activeDates.has(cursor)) {
    streak++;
    cursor = addUtcDays(cursor, -1);
  }
  return streak;
}

export function computeLongestStreak(activeDates: Set<string>): number {
  if (activeDates.size === 0) return 0;

  const sorted = [...activeDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const day = sorted[i]!;
    const expectedNext = addUtcDays(prev, 1);
    if (day === expectedNext) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export type ActivityLevel = 0 | 1 | 2 | 3;

export const ACTIVITY_WEEKS = 9;

export function activityLevelFromCount(count: number): ActivityLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

/**
 * GitHub-style grid: 7 rows (Sun–Sat), columns = weeks (oldest left, current week right).
 */
export function buildActivityGrid(
  countsByDay: Record<string, number>,
  weeks = ACTIVITY_WEEKS,
  now = new Date()
): ActivityLevel[][] {
  const endStr = toUtcDateString(now);
  const endDow = now.getUTCDay();
  const lastWeekSunday = addUtcDays(endStr, -endDow);

  const grid: ActivityLevel[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: weeks }, () => 0 as ActivityLevel)
  );

  for (let col = 0; col < weeks; col++) {
    const weekSunday = addUtcDays(lastWeekSunday, -(weeks - 1 - col) * 7);
    for (let row = 0; row < 7; row++) {
      const date = addUtcDays(weekSunday, row);
      if (date > endStr) continue;
      const rowCells = grid[row]!;
      rowCells[col] = activityLevelFromCount(countsByDay[date] ?? 0);
    }
  }

  return grid;
}

export function getStreakBadges(currentStreak: number, longestStreak: number): string[] {
  const badges: string[] = [];
  if (longestStreak >= 3) badges.push('3 Day Streak');
  if (longestStreak >= 7) badges.push('7 Day Streak');
  if (longestStreak >= 14) badges.push('14 Day Streak');
  if (longestStreak >= 30) badges.push('30 Day Streak');
  return badges;
}

export async function getActivityCountsForUser(userId: number): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  const bump = (createdAt: Date | null) => {
    if (!createdAt) return;
    const day = toUtcDateString(createdAt);
    counts[day] = (counts[day] ?? 0) + 1;
  };

  const [reportRows, cleanupRows, cleanupVoteRows, reportVoteRows] = await Promise.all([
    db
      .select({ createdAt: reports.createdAt })
      .from(reports)
      .where(eq(reports.userId, userId)),
    db
      .select({ createdAt: cleanupSubmissions.createdAt })
      .from(cleanupSubmissions)
      .where(eq(cleanupSubmissions.userId, userId)),
    db
      .select({ createdAt: cleanupSubmissionVotes.createdAt })
      .from(cleanupSubmissionVotes)
      .where(eq(cleanupSubmissionVotes.userId, userId)),
    db
      .select({ createdAt: reportVerificationVotes.createdAt })
      .from(reportVerificationVotes)
      .where(eq(reportVerificationVotes.userId, userId)),
  ]);

  for (const row of reportRows) bump(row.createdAt);
  for (const row of cleanupRows) bump(row.createdAt);
  for (const row of cleanupVoteRows) bump(row.createdAt);
  for (const row of reportVoteRows) bump(row.createdAt);

  return counts;
}

export async function getActiveDatesForUser(userId: number): Promise<Set<string>> {
  const counts = await getActivityCountsForUser(userId);
  return new Set(Object.keys(counts));
}

export async function getStreakStatsForUser(userId: number, now = new Date()) {
  const countsByDay = await getActivityCountsForUser(userId);
  const activeDates = new Set(Object.keys(countsByDay));
  const currentStreak = computeCurrentStreak(activeDates, now);
  const longestStreak = computeLongestStreak(activeDates);
  const activityGrid = buildActivityGrid(countsByDay, ACTIVITY_WEEKS, now);
  return {
    currentStreak,
    longestStreak,
    badges: getStreakBadges(currentStreak, longestStreak),
    activity: { weeks: ACTIVITY_WEEKS, grid: activityGrid },
  };
}
