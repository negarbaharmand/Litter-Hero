import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activityLevelFromCount,
  addUtcDays,
  buildActivityGrid,
  computeCurrentStreak,
  computeLongestStreak,
  getStreakBadges,
  toUtcDateString,
} from './streak.js';

function dateSet(...dates: string[]): Set<string> {
  return new Set(dates);
}

test('toUtcDateString uses UTC calendar day', () => {
  assert.equal(toUtcDateString(new Date('2026-01-15T23:30:00.000Z')), '2026-01-15');
  assert.equal(toUtcDateString(new Date('2026-01-16T00:30:00.000Z')), '2026-01-16');
});

test('computeCurrentStreak returns 0 with no activity', () => {
  assert.equal(computeCurrentStreak(dateSet(), new Date('2026-05-26T12:00:00.000Z')), 0);
});

test('computeCurrentStreak counts consecutive days ending today', () => {
  const active = dateSet('2026-05-24', '2026-05-25', '2026-05-26');
  assert.equal(computeCurrentStreak(active, new Date('2026-05-26T12:00:00.000Z')), 3);
});

test('computeCurrentStreak counts from yesterday when inactive today', () => {
  const active = dateSet('2026-05-24', '2026-05-25');
  assert.equal(computeCurrentStreak(active, new Date('2026-05-26T12:00:00.000Z')), 2);
});

test('computeCurrentStreak returns 0 when last activity was two days ago', () => {
  const active = dateSet('2026-05-24');
  assert.equal(computeCurrentStreak(active, new Date('2026-05-26T12:00:00.000Z')), 0);
});

test('computeCurrentStreak stops at gap in consecutive days', () => {
  const active = dateSet('2026-05-22', '2026-05-26');
  assert.equal(computeCurrentStreak(active, new Date('2026-05-26T12:00:00.000Z')), 1);
});

test('computeLongestStreak returns 0 for empty set', () => {
  assert.equal(computeLongestStreak(dateSet()), 0);
});

test('computeLongestStreak finds maximum consecutive run', () => {
  const active = dateSet('2026-01-01', '2026-01-02', '2026-01-03', '2026-01-10', '2026-01-11');
  assert.equal(computeLongestStreak(active), 3);
});

test('computeLongestStreak handles single day', () => {
  assert.equal(computeLongestStreak(dateSet('2026-03-01')), 1);
});

test('addUtcDays shifts calendar dates in UTC', () => {
  assert.equal(addUtcDays('2026-05-26', -1), '2026-05-25');
  assert.equal(addUtcDays('2026-05-26', 1), '2026-05-27');
});

test('getStreakBadges awards by current and longest thresholds', () => {
  assert.deepEqual(getStreakBadges(2, 29), []);
  assert.deepEqual(getStreakBadges(3, 29), ['🔥|3 Day Streak']);
  assert.deepEqual(getStreakBadges(7, 29), ['🔥|3 Day Streak', '🔥|7 Day Streak']);
  assert.deepEqual(getStreakBadges(1, 30), ['🔥|30 Day Streak']);
});

test('activityLevelFromCount maps action counts to heatmap levels', () => {
  assert.equal(activityLevelFromCount(0), 0);
  assert.equal(activityLevelFromCount(1), 1);
  assert.equal(activityLevelFromCount(3), 2);
  assert.equal(activityLevelFromCount(4), 3);
});

test('buildActivityGrid fills today with the correct level', () => {
  const now = new Date('2026-05-26T15:00:00.000Z'); // Tuesday
  const today = toUtcDateString(now);
  const grid = buildActivityGrid({ [today]: 2 }, 9, now);
  const tuesdayRow = 2;
  const lastCol = 8;
  assert.equal(grid[tuesdayRow]![lastCol], 2);
});
