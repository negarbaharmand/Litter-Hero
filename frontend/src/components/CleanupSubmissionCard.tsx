import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  voteOnCleanupSubmission,
  type CleanupSubmissionWithVotes,
} from '../api';
import { useAuth } from '../hooks/useAuth';

type CleanupSubmissionCardProps = {
  reportId: number;
  reportOwnerUserId: number;
  submission: CleanupSubmissionWithVotes;
  requireAuth: (message: string, action: () => void) => void;
};

type StatusConfig = { label: string; bg: string; color: string };

function getStatusConfig(status: CleanupSubmissionWithVotes['status']): StatusConfig {
  switch (status) {
    case 'pending':
      return { label: 'Pending votes', bg: 'var(--color-surface)', color: 'var(--color-text-muted)' };
    case 'approved':
      return { label: '✓ Approved', bg: 'color-mix(in srgb, var(--color-green-dark) 12%, transparent)', color: 'var(--color-green-dark)' };
    case 'rejected':
      return { label: '✗ Rejected', bg: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#b91c1c' };
    case 'expired':
      return { label: 'Expired', bg: 'color-mix(in srgb, #f59e0b 12%, transparent)', color: '#92400e' };
    default:
      return { label: status, bg: 'var(--color-surface)', color: 'var(--color-text-muted)' };
  }
}

export function CleanupSubmissionCard({
  reportId,
  reportOwnerUserId,
  submission,
  requireAuth,
}: CleanupSubmissionCardProps) {
  const queryClient = useQueryClient();
  const { authState, refreshUser } = useAuth();
  const [voteError, setVoteError] = useState<string | null>(null);
  const voteInFlightRef = useRef(false);

  const currentUserId =
    authState.status === 'authenticated' ? authState.user.id : null;

  const cannotVoteReason =
    submission.status !== 'pending'
      ? 'This submission is already resolved.'
      : currentUserId === reportOwnerUserId
        ? 'You cannot vote on your own report.'
        : currentUserId === submission.userId
          ? 'You cannot vote on your own cleanup submission.'
          : submission.voteSummary.myVote
            ? 'You already voted on this submission.'
            : null;

  const voteMutation = useMutation({
    mutationFn: (vote: 'clean' | 'not_clean') =>
      voteOnCleanupSubmission(reportId, submission.id, vote),
    onSuccess: () => {
      setVoteError(null);
      voteInFlightRef.current = false;
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['vote-queue'] });
      refreshUser();
    },
    onError: (err) => {
      voteInFlightRef.current = false;
      setVoteError(err instanceof Error ? err.message : 'Failed to submit vote.');
    },
  });

  function handleVote(vote: 'clean' | 'not_clean') {
    if (voteInFlightRef.current) return;
    setVoteError(null);
    requireAuth('Log in to vote on cleanup proof', () => {
      if (voteInFlightRef.current) return;
      voteInFlightRef.current = true;
      voteMutation.mutate(vote);
    });
  }

  const { voteSummary } = submission;
  const VOTE_THRESHOLD = 3;
  const votesNeeded = Math.max(0, VOTE_THRESHOLD - voteSummary.totalVotes);
  const progressPct = Math.min(100, (voteSummary.totalVotes / VOTE_THRESHOLD) * 100);
  const statusConfig = getStatusConfig(submission.status);
  const isPending = submission.status === 'pending';

  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-page-bg)' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🧹</span>
            <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Cleanup proof #{submission.id}
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Proof image */}
      <img
        src={submission.imageUrl}
        alt="Cleanup proof"
        className="aspect-[4/3] w-full object-cover"
      />
      {submission.note && (
        <p className="px-5 pt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {submission.note}
        </p>
      )}

      {/* Vote stats + progress */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {voteSummary.totalVotes} / {VOTE_THRESHOLD} votes
          </span>
          {isPending && votesNeeded > 0 && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {votesNeeded} more needed
            </span>
          )}
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              backgroundColor: submission.status === 'rejected' ? '#ef4444' : 'var(--color-green-dark)',
            }}
          />
        </div>

        {/* Pill stats */}
        <div className="mt-3 flex gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-green-dark) 12%, transparent)', color: 'var(--color-green-dark)' }}
          >
            ✓ Clean &nbsp;{voteSummary.cleanVotes}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#b91c1c' }}
          >
            ✗ Not clean &nbsp;{voteSummary.notCleanVotes}
          </span>
        </div>

        {/* Your vote badge */}
        {voteSummary.myVote && (
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-green-dark) 10%, transparent)',
              color: 'var(--color-green-dark)',
              border: '1px solid color-mix(in srgb, var(--color-green-dark) 25%, transparent)',
            }}
          >
            <span>✓</span>
            <span>Your vote: {voteSummary.myVote === 'clean' ? 'Clean' : 'Not clean'}</span>
          </div>
        )}
      </div>

      {/* Action area */}
      {isPending && !cannotVoteReason ? (
        <div className="px-5 pb-5 flex flex-wrap gap-2" role="region" aria-label="Submission voting">
          <button
            type="button"
            onClick={() => handleVote('clean')}
            disabled={voteMutation.isPending}
            className="flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-green-dark)' }}
          >
            {voteMutation.isPending ? 'Submitting…' : '✓ Looks clean'}
          </button>
          <button
            type="button"
            onClick={() => handleVote('not_clean')}
            disabled={voteMutation.isPending}
            className="flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-body)',
            }}
          >
            ✗ Not clean
          </button>
        </div>
      ) : cannotVoteReason ? (
        <div
          className="mx-5 mb-5 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
        >
          {cannotVoteReason}
        </div>
      ) : null}

      {voteError && (
        <p className="px-5 pb-4 text-sm" style={{ color: 'var(--color-danger)' }}>
          {voteError}
        </p>
      )}
    </div>
  );
}
