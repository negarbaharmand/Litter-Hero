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

  return (
    <div className="rounded-2xl p-4 shadow-sm"
      style={{ backgroundColor: 'var(--color-page-bg)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">🗳️</span>
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Is this actually trash?</h2>
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-body)' }}>
        Help the community verify this report. Three votes decide — earn <span className="font-semibold" style={{ color: 'var(--color-green-dark)' }}>+3 points</span> for each vote you cast.
      </p>

      <div className="mt-3 flex flex-wrap gap-3 text-sm" style={{ color: 'var(--color-text-body)' }}>
        <span>
          <span className="font-semibold" style={{ color: 'var(--color-green-dark)' }}>{voteSummary.legitVotes}</span> legit
        </span>
        <span>
          <span className="font-semibold text-amber-500">{voteSummary.notTrashVotes}</span> not trash
        </span>
        <span>
          <span className="font-semibold">{voteSummary.totalVotes}</span>/{REPORT_VOTE_THRESHOLD} votes
        </span>
      </div>

      {votesNeeded > 0 && !voteSummary.myVote && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {votesNeeded} more vote{votesNeeded === 1 ? '' : 's'} needed for a decision.
        </p>
      )}

      {!cannotVoteReason && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleVote('legit')}
            disabled={voteMutation.isPending}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-green-dark)' }}
          >
            Looks like trash
          </button>
          <button
            type="button"
            onClick={() => handleVote('not_trash')}
            disabled={voteMutation.isPending}
            className="rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-body)', border: '1px solid var(--color-border)' }}
          >
            Not trash
          </button>
        </div>
      )}

      {cannotVoteReason && (
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{cannotVoteReason}</p>
      )}

      {voteSummary.myVote && (
        <p className="mt-2 text-sm" style={{ color: 'var(--color-green-dark)' }}>
          Your vote: {voteSummary.myVote === 'legit' ? 'Looks like trash' : 'Not trash'}
        </p>
      )}

      {voteError && <p className="mt-2 text-sm text-red-500">{voteError}</p>}
    </div>
  );
}
