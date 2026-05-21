import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateWeeklyPoints,
  CLEANUP_POINTS,
  CLEANUP_VOTE_THRESHOLD,
  REPORT_POINTS,
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

test('calculateWeeklyPoints applies +10 for reports and +20 for approved cleanups', () => {
  const result = calculateWeeklyPoints({
    weeklyReportsCreated: 3,
    weeklyApprovedCleanups: 2,
  });
  assert.equal(result, 3 * REPORT_POINTS + 2 * CLEANUP_POINTS);
  assert.equal(result, 70);
});
