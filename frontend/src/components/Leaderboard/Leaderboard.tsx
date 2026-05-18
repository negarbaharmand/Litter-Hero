import { useState } from 'react';
import { useLeaderboard, type TimePeriod } from '../../hooks/useLeaderboard';
import { LeaderboardTable } from './LeaderboardTable';
import { TimePeriodFilter } from './TimePeriodFilter';

export function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('allTime');
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'username'>('rank');
  const { data, isLoading, isError, error } = useLeaderboard(selectedPeriod);

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-shell__inner">
          <p className="text-body-lg" style={{ color: 'var(--color-green-dark)' }}>Loading leaderboard data... ⏳</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-shell">
        <div className="page-shell__inner">
          <p className="text-body-lg text-danger">Error loading leaderboard: {(error as Error).message} ❌</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-shell__inner">
        <h2 style={{ marginBottom: '1rem' }}>Leaderboard</h2>
        <TimePeriodFilter selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
        {data && data.entries.length > 0 ? (
          <LeaderboardTable entries={data.entries} sortBy={sortBy} onSortChange={setSortBy} />
        ) : (
          <p className="text-body-lg" style={{ color: 'var(--color-green-dark)' }}>No leaderboard data available</p>
        )}
        <p className="text-body-sm mt-4" style={{ color: 'var(--color-text-muted)'}}>Last updated: {data?.lastUpdated}</p>
      </div>
    </div>
  );
}