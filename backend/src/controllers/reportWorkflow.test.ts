import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateWeeklyPoints,
  CLEANUP_VOTE_THRESHOLD,
  getCleanupPointsForSize,
  getReportPointsForSize,
  resolveCleanupFromVotes,
  summarizeVotes,
} from './reportWorkflow.js';

test('summarizeVotes counts clean and not_clean votes', () => {
  const result = summarizeVotes(['clean', 'not_clean', 'clean']);
  assert.equal(result.totalVotes, 3);
  assert.equal(result.cleanVotes, 2);
  assert.equal(result.notCleanVotes, 1);
});

test('resolveCleanupFromVotes stays pending before threshold', () => {
  const result = resolveCleanupFromVotes(['clean', 'not_clean'], CLEANUP_VOTE_THRESHOLD);
  assert.equal(result, 'pending');
});

test('resolveCleanupFromVotes approves when clean votes are majority at threshold', () => {
  const result = resolveCleanupFromVotes(['clean', 'clean', 'not_clean'], CLEANUP_VOTE_THRESHOLD);
  assert.equal(result, 'approved');
});

test('resolveCleanupFromVotes rejects when not_clean votes tie or win at threshold', () => {
  const tieResult = resolveCleanupFromVotes(['clean', 'not_clean', 'not_clean'], CLEANUP_VOTE_THRESHOLD);
  assert.equal(tieResult, 'rejected');

  const noCleanMajority = resolveCleanupFromVotes(['clean', 'not_clean', 'clean', 'not_clean'], 4);
  assert.equal(noCleanMajority, 'rejected');
});

test('size-based report points increase with trash size', () => {
  assert.equal(getReportPointsForSize('small'), 10);
  assert.equal(getReportPointsForSize('medium'), 15);
  assert.equal(getReportPointsForSize('large'), 20);
  assert.equal(getReportPointsForSize('unknown'), 10);
});

test('size-based cleanup points increase with trash size', () => {
  assert.equal(getCleanupPointsForSize('small'), 20);
  assert.equal(getCleanupPointsForSize('medium'), 30);
  assert.equal(getCleanupPointsForSize('large'), 40);
  assert.equal(getCleanupPointsForSize(undefined), 20);
});

test('calculateWeeklyPoints sums size-weighted report and cleanup points', () => {
  const result = calculateWeeklyPoints({
    weeklyReportSizes: ['small', 'large', 'medium'],
    weeklyApprovedCleanupSizes: ['small', 'large'],
  });
  assert.equal(result, 10 + 20 + 15 + 20 + 40);
  assert.equal(result, 105);
});
