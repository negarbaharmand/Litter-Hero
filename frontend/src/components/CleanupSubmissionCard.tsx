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

function formatSubmissionStatus(status: CleanupSubmissionWithVotes['status']) {
  switch (status) {
    case 'pending':
      return 'Pending votes';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'expired':
      return 'Expired';
    default:
      return status;
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
      : currentUserId === submission.userId
        ? 'You cannot vote on your own cleanup submission.'
        : currentUserId === reportOwnerUserId
          ? 'You cannot vote on cleanup for your own report.'
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
      refreshUser();
    },
    onError: (err) => {
      voteInFlightRef.current = false;
      setVoteError(err instanceof Error ? err.message : 'Failed to submit vote.');
    },
  });

  function handleVote(vote: 'clean' | 'not_clean') {
    if (voteInFlightRef.current) {
      return;
    }

    voteInFlightRef.current = true;
    setVoteError(null);
    requireAuth('Log in to vote on cleanup proof', () => voteMutation.mutate(vote));
  }

  const { voteSummary } = submission;
  const votesNeeded = Math.max(0, 3 - voteSummary.totalVotes);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">
          Cleanup proof #{submission.id}
        </p>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700">
          {formatSubmissionStatus(submission.status)}
        </span>
      </div>

      <img
        src={submission.imageUrl}
        alt="Cleanup proof"
        className="mt-3 max-h-48 w-full rounded-lg object-cover"
      />

      {submission.note && (
        <p className="mt-2 text-sm text-slate-600">{submission.note}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-700">
        <span>
          <span className="font-semibold text-emerald-700">{voteSummary.cleanVotes}</span> clean
        </span>
        <span>
          <span className="font-semibold text-amber-700">{voteSummary.notCleanVotes}</span> not clean
        </span>
        <span>
          <span className="font-semibold">{voteSummary.totalVotes}</span>/3 votes
        </span>
      </div>

      {submission.status === 'pending' && votesNeeded > 0 && (
        <p className="mt-1 text-xs text-slate-500">
          {votesNeeded} more vote{votesNeeded === 1 ? '' : 's'} needed for a decision.
        </p>
      )}

      {submission.status === 'pending' && !cannotVoteReason && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (voteMutation.isPending || voteInFlightRef.current) {
                return;
              }
              handleVote('clean');
            }}
            disabled={voteMutation.isPending || voteInFlightRef.current}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Vote clean
          </button>
          <button
            type="button"
            onClick={() => {
              if (voteMutation.isPending || voteInFlightRef.current) {
                return;
              }
              handleVote('not_clean');
            }}
            disabled={voteMutation.isPending || voteInFlightRef.current}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            Vote not clean
          </button>
        </div>
      )}

      {cannotVoteReason && submission.status === 'pending' && (
        <p className="mt-3 text-sm text-slate-500">{cannotVoteReason}</p>
      )}

      {submission.voteSummary.myVote && (
        <p className="mt-2 text-sm text-emerald-700">
          Your vote: {submission.voteSummary.myVote === 'clean' ? 'Clean' : 'Not clean'}
        </p>
      )}

      {voteError && <p className="mt-2 text-sm text-red-600">{voteError}</p>}
    </div>
  );
}
