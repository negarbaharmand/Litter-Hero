import { useState } from 'react';
import { useLeaderboard, type TimePeriod } from '../../hooks/useLeaderboard';
import { LeaderboardTable } from './LeaderboardTable';
import { TimePeriodFilter } from './TimePeriodFilter';
<<<<<<< HEAD
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
=======

export function Leaderboard() {
  // State för vald tidsperiod
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('allTime');

  // State för sorting
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'username'>('rank');

  // Fetch data 
  const { data, isLoading, isError, error } = useLeaderboard(selectedPeriod);

  // hantera loading state
  if (isLoading) {
    return (
      <div className="leaderboard-container text-slate-100 p-6">
        <h2>🏆 Leaderboard</h2>
        <div className="loading-message text-emerald-400">Loading leaderboard data... ⏳</div>
      </div>
    );
  }

  // hantera error state
  if (isError) {
    return (
      <div className="leaderboard-container p-6">
        <h2 className="text-slate-100">🏆 Leaderboard</h2>
        <div className="error-message text-red-400">
          Error loading leaderboard: {(error as Error).message} ❌
        </div>
      </div>
>>>>>>> origin/main
    );
  }

  return (
<<<<<<< HEAD
    <PageShell>
      <h2 style={{ marginBottom: '1rem' }}>Leaderboard</h2>
      <TimePeriodFilter selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      {data && data.entries.length > 0 ? (
        <LeaderboardTable entries={data.entries} sortBy={sortBy} onSortChange={setSortBy} />
      ) : (
        <p className="text-body-lg" style={{ color: 'var(--color-green-dark)' }}>No leaderboard data available</p>
      )}
      <p className="text-body-sm mt-4" style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
        Last updated: {data?.lastUpdated}
      </p>
    </PageShell>
  );
}
=======
    <div className="leaderboard-container text-slate-100 p-6">
      <h2>🏆 Leaderboard</h2>
      
      {/* tids filter knappar */}
      <TimePeriodFilter selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

      {/* Main table */}
      {data && data.entries.length > 0 ? (
        <LeaderboardTable entries={data.entries} sortBy={sortBy} onSortChange={setSortBy} />
      ) : (
        <div className="empty-message text-emerald-400">No leaderboard data available</div>
      )}

      {/* Footer med information om senaste uppdatering */}
      <p className="last-updated text-emerald-400 text-sm mt-4">Last updated: {data?.lastUpdated}</p>
    </div>
  );
}
>>>>>>> origin/main
