import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchVoteQueue } from '../api';
import { useAuthGate } from '../hooks/useAuthGate';
import { AuthGateModal } from './AuthGateModal';
import { ReportVerificationCard } from './ReportVerificationCard';
import { CleanupSubmissionCard } from './CleanupSubmissionCard';

export function VoteQueue() {
  const { gate, dismiss, requireAuth } = useAuthGate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vote-queue'],
    queryFn: fetchVoteQueue,
  });

  if (isLoading) {
    return <div className="p-6" style={{ color: 'var(--color-text-muted)' }}>Loading vote queue... ⏳</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load vote queue.</div>;
  }

  const trashItems = data?.trashVerifications ?? [];
  const cleanupItems = data?.cleanupVerifications ?? [];
  const totalItems = trashItems.length + cleanupItems.length;

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <p className="text-4xl mb-4">🎉</p>
        <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
          All caught up!
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No reports or cleanups are waiting for your vote right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm px-1" style={{ color: 'var(--color-text-muted)' }}>
        {totalItems} item{totalItems === 1 ? '' : 's'} waiting for your vote.
        Each vote earns you <span className="font-semibold" style={{ color: 'var(--color-green-dark)' }}>+3 points</span>.
      </p>

      {trashItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 px-1"
            style={{ color: 'var(--color-text-muted)' }}>
            🗳️ Is this trash? ({trashItems.length})
          </h3>
          <div className="space-y-4">
            {trashItems.map((item) => (
              <div key={item.reportId} className="rounded-2xl p-4 shadow-sm"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {item.location}
                    </p>
                    {item.description && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/reports/${item.reportId}`}
                    className="shrink-0 text-xs font-medium text-emerald-700 hover:underline"
                  >
                    View →
                  </Link>
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="Report"
                    className="w-full max-h-48 object-cover rounded-lg mb-3"
                  />
                )}
                <ReportVerificationCard
                  reportId={item.reportId}
                  reportOwnerUserId={item.ownerUserId}
                  voteSummary={item.voteSummary}
                  requireAuth={requireAuth}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {cleanupItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 px-1"
            style={{ color: 'var(--color-text-muted)' }}>
            🧹 Was this cleaned? ({cleanupItems.length})
          </h3>
          <div className="space-y-4">
            {cleanupItems.map((item) => (
              <div key={item.submission.id} className="rounded-2xl p-4 shadow-sm"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {item.reportLocation}
                  </p>
                  <Link
                    to={`/reports/${item.reportId}`}
                    className="shrink-0 text-xs font-medium text-emerald-700 hover:underline"
                  >
                    View →
                  </Link>
                </div>
                <CleanupSubmissionCard
                  reportId={item.reportId}
                  reportOwnerUserId={item.reportOwnerUserId}
                  submission={item.submission}
                  requireAuth={requireAuth}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <AuthGateModal open={gate.open} message={gate.message} onDismiss={dismiss} />
    </div>
  );
}
