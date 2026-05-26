import { useState } from 'react';
import { useLeaderboard, type TimePeriod } from '../../hooks/useLeaderboard';
import { LeaderboardTable } from './LeaderboardTable';
import { TimePeriodFilter } from './TimePeriodFilter';
import { PageShell } from '../PageShell';

export function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('allTime');
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'username'>('rank');
  const { data, isLoading, isError, error } = useLeaderboard(selectedPeriod);

  if (isLoading) {
    return (
      <PageShell>
        <p className="text-body-lg" style={{ color: 'var(--color-green-dark)' }}>Loading leaderboard data... ⏳</p>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell>
        <p className="text-body-lg" style={{ color: 'var(--color-danger)' }}>
          Error loading leaderboard: {(error as Error).message} ❌
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h2 style={{ marginBottom: '1rem' }}>Leaderboard</h2>
      <TimePeriodFilter selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      {data && data.entries.length > 0 ? (
        <LeaderboardTable entries={data.entries} sortBy={sortBy} onSortChange={setSortBy} />
      ) : (
        <p className="text-body-lg" style={{ color: 'var(--color-green-dark)' }}>No leaderboard data available</p>
      )}
      <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '1rem' }}>
        Last updated: {data?.lastUpdated}
      </p>
    </PageShell>
  );
}
