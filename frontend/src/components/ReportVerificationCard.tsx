import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  voteOnReportVerification,
  type ReportVerificationVoteSummary,
} from '../api';
import { useAuth } from '../hooks/useAuth';
import { REPORT_VOTE_THRESHOLD } from '../constants';

type ReportVerificationCardProps = {
  reportId: number;
  reportOwnerUserId: number;
  voteSummary: ReportVerificationVoteSummary;
  requireAuth: (message: string, action: () => void) => void;
};

export function ReportVerificationCard({
  reportId,
  reportOwnerUserId,
  voteSummary,
  requireAuth,
}: ReportVerificationCardProps) {
  const queryClient = useQueryClient();
  const { authState, refreshUser } = useAuth();
  const [voteError, setVoteError] = useState<string | null>(null);

  const currentUserId =
    authState.status === 'authenticated' ? authState.user.id : null;

  const cannotVoteReason =
    currentUserId === reportOwnerUserId
      ? 'You cannot vote on your own report.'
      : voteSummary.myVote
        ? 'You already voted on this report.'
        : null;

  const voteMutation = useMutation({
    mutationFn: (vote: 'legit' | 'not_trash') =>
      voteOnReportVerification(reportId, vote),
    onSuccess: () => {
      setVoteError(null);
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['vote-queue'] });
      refreshUser();
    },
    onError: (err) => {
      setVoteError(err instanceof Error ? err.message : 'Failed to submit vote.');
    },
  });

  function handleVote(vote: 'legit' | 'not_trash') {
    setVoteError(null);
    requireAuth('Log in to help verify this report', () => voteMutation.mutate(vote));
  }

  const votesNeeded = Math.max(0, REPORT_VOTE_THRESHOLD - voteSummary.totalVotes);

  const progressPct = Math.min(100, (voteSummary.totalVotes / REPORT_VOTE_THRESHOLD) * 100);

  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden"
      style={{ backgroundColor: 'var(--color-page-bg)', border: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🗳️</span>
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Community Verification
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Is this actually trash? Help verify — earn{' '}
          <span className="font-semibold" style={{ color: 'var(--color-green-dark)' }}>+3 pts</span>{' '}
          per vote.
        </p>
      </div>

      {/* Vote stats + progress */}
      <div className="px-5 py-4">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {voteSummary.totalVotes} / {REPORT_VOTE_THRESHOLD} votes
          </span>
          {votesNeeded > 0 && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {votesNeeded} more needed
            </span>
          )}
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: 'var(--color-green-dark)' }}
          />
        </div>

        {/* Pill stats */}
        <div className="mt-3 flex gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-green-dark) 12%, transparent)', color: 'var(--color-green-dark)' }}
          >
            ✓ Trash &nbsp;{voteSummary.legitVotes}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 12%, transparent)', color: '#b45309' }}
          >
            ✗ Not trash &nbsp;{voteSummary.notTrashVotes}
          </span>
        </div>

        {/* Your vote badge */}
        {voteSummary.myVote && (
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-green-dark) 10%, transparent)', color: 'var(--color-green-dark)', border: '1px solid color-mix(in srgb, var(--color-green-dark) 25%, transparent)' }}
          >
            <span>✓</span>
            <span>Your vote: {voteSummary.myVote === 'legit' ? 'Looks like trash' : 'Not trash'}</span>
          </div>
        )}
      </div>

      {/* Action area */}
      {!cannotVoteReason ? (
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleVote('legit')}
            disabled={voteMutation.isPending}
            className="flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-green-dark)' }}
          >
            {voteMutation.isPending ? 'Submitting…' : '✓ Looks like trash'}
          </button>
          <button
            type="button"
            onClick={() => handleVote('not_trash')}
            disabled={voteMutation.isPending}
            className="flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-body)', border: '1px solid var(--color-border)' }}
          >
            ✗ Not trash
          </button>
        </div>
      ) : (
        <div
          className="mx-5 mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
        >
          {cannotVoteReason}
        </div>
      )}

      {voteError && (
        <p className="px-5 pb-4 text-sm text-red-500">{voteError}</p>
      )}
    </div>
  );
}
