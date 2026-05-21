export const REPORT_POINTS = 10;
export const CLEANUP_POINTS = 20;
export const CLEANUP_VOTE_THRESHOLD = 3;

export type CleanupVote = 'clean' | 'not_clean';
export type CleanupResolution = 'pending' | 'approved' | 'rejected';

export function summarizeVotes(votes: CleanupVote[]) {
  const cleanVotes = votes.filter((vote) => vote === 'clean').length;
  const notCleanVotes = votes.filter((vote) => vote === 'not_clean').length;
  const totalVotes = votes.length;

  return {
    totalVotes,
    cleanVotes,
    notCleanVotes,
  };
}

export function resolveCleanupFromVotes(
  votes: CleanupVote[],
  threshold: number = CLEANUP_VOTE_THRESHOLD
): CleanupResolution {
  const { totalVotes, cleanVotes, notCleanVotes } = summarizeVotes(votes);
  if (totalVotes < threshold) return 'pending';
  return cleanVotes > notCleanVotes ? 'approved' : 'rejected';
}

export function calculateWeeklyPoints({
  weeklyReportsCreated,
  weeklyApprovedCleanups,
}: {
  weeklyReportsCreated: number;
  weeklyApprovedCleanups: number;
}) {
  return weeklyReportsCreated * REPORT_POINTS + weeklyApprovedCleanups * CLEANUP_POINTS;
}
