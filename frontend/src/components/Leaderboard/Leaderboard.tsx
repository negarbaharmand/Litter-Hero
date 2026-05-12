import { useState } from 'react';
import { useLeaderboard, type TimePeriod } from '../../hooks/useLeaderboard';
import { LeaderboardTable } from './LeaderboardTable';
import { TimePeriodFilter } from './TimePeriodFilter';

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
      <div
        className="leaderboard-container min-h-screen bg-[#eefcf3] text-slate-100 p-6 pb-24 lg:pb-6 lg:pt-[74px]"
      >
        <div className="loading-message text-emerald-400">Loading leaderboard data... ⏳</div>
      </div>
    );
  }

  // hantera error state
  if (isError) {
    return (
      <div
        className="leaderboard-container min-h-screen bg-[#eefcf3] p-6 pb-24 lg:pb-6 lg:pt-[74px]"
      >
        <div className="error-message text-red-400">
          Error loading leaderboard: {(error as Error).message} ❌
        </div>
      </div>
    );
  }

  return (
    <div
      className="leaderboard-container min-h-screen bg-[#eefcf3] text-slate-100 p-6 pb-24 lg:pb-6 lg:pt-[74px]"
    >
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