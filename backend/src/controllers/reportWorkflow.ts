export const CLEANUP_VOTE_THRESHOLD = 3;
export const REPORT_VOTE_THRESHOLD = 3;
export const REPORT_VERIFICATION_VOTER_POINTS = 3;

export type CleanupVote = 'clean' | 'not_clean';
export type CleanupResolution = 'pending' | 'approved' | 'rejected';

export type ReportVerificationVote = 'legit' | 'not_trash';
export type ReportVerificationResolution = 'pending' | 'verified' | 'rejected';
export type TrashSize = 'small' | 'medium' | 'large';

const REPORT_POINTS_BY_SIZE: Record<TrashSize, number> = {
  small: 10,
  medium: 15,
  large: 20,
};

const CLEANUP_POINTS_BY_SIZE: Record<TrashSize, number> = {
  small: 20,
  medium: 30,
  large: 40,
};

function normalizeSize(size: unknown): TrashSize {
  if (typeof size !== 'string') return 'small';
  const normalized = size.trim().toLowerCase();
  if (normalized === 'medium' || normalized === 'large') return normalized;
  return 'small';
}

export function getReportPointsForSize(size: unknown): number {
  return REPORT_POINTS_BY_SIZE[normalizeSize(size)];
}

export function getCleanupPointsForSize(size: unknown): number {
  return CLEANUP_POINTS_BY_SIZE[normalizeSize(size)];
}

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

export function summarizeReportVotes(votes: ReportVerificationVote[]) {
  const legitVotes = votes.filter((v) => v === 'legit').length;
  const notTrashVotes = votes.filter((v) => v === 'not_trash').length;
  const totalVotes = votes.length;
  return { totalVotes, legitVotes, notTrashVotes };
}

export function resolveReportFromVotes(
  votes: ReportVerificationVote[],
  threshold: number = REPORT_VOTE_THRESHOLD
): ReportVerificationResolution {
  const { totalVotes, legitVotes, notTrashVotes } = summarizeReportVotes(votes);
  if (totalVotes < threshold) return 'pending';
  return legitVotes > notTrashVotes ? 'verified' : 'rejected';
}

export function calculateWeeklyPoints({
  weeklyReportSizes,
  weeklyApprovedCleanupSizes,
}: {
  weeklyReportSizes: Array<string | null>;
  weeklyApprovedCleanupSizes: Array<string | null>;
}) {
  const reportPoints = weeklyReportSizes.reduce(
    (sum, size) => sum + getReportPointsForSize(size),
    0
  );

  const cleanupPoints = weeklyApprovedCleanupSizes.reduce(
    (sum, size) => sum + getCleanupPointsForSize(size),
    0
  );

  return reportPoints + cleanupPoints;
}
