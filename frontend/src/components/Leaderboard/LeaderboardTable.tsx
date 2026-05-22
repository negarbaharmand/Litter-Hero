import { type LeaderboardEntry } from './LeaderboardTypes';
import ProfilePicture from './leaderboardAvatar';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sortBy: 'rank' | 'points' | 'username';
  onSortChange: (sortBy: 'rank' | 'points' | 'username') => void;
}

export function LeaderboardTable({ entries, sortBy }: LeaderboardTableProps) {
  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'rank': return a.rank - b.rank;
      case 'points': return b.points - a.points;
      case 'username': return a.username.localeCompare(b.username);
      default: return 0;
    }
  });

  const topThreeEntries = [...entries]
    .sort((a, b) => a.rank - b.rank)
    .filter((entry) => entry.rank <= 3)
    .slice(0, 3);

  const remainingEntries = sortedEntries.filter((entry) => entry.rank > 3);

  return (
    <div className="space-y-4">
      {/* Top 3 kort */}
      {topThreeEntries.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {topThreeEntries.map((entry) => (
            <div key={entry.id} className="card min-w-36 flex-1 text-center">
              <div className="mx-auto mb-2 w-fit">
                <ProfilePicture username={entry.username} profilePictureUrl={entry.profilePictureUrl} />
              </div>
              <div className="text-body-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {entry.username}
              </div>
              <div className="text-body-sm font-medium mt-1" style={{ color: 'var(--color-text-primary)' }}>
                {entry.points} pts
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                {entry.reportsSubmitted} reports · {entry.reportsResolved} cleanups
              </div>
              <div
                className="mt-2 inline-block rounded-full px-3 py-1 text-body-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--color-green-dark)' }}
              >
                #{entry.rank}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resterande rader */}
      <div className="space-y-3">
        {remainingEntries.map((entry) => (
          <div key={entry.id} className="card flex items-center justify-between gap-4 hover:bg-green-light transition">
            <div className="w-12 text-body-lg font-bold" style={{ color: 'var(--color-green-dark)' }}>
              #{entry.rank}
            </div>
            <ProfilePicture username={entry.username} profilePictureUrl={entry.profilePictureUrl} />
            <div className="flex-1 text-body-lg" style={{ color: 'var(--color-text-primary)' }}>
              <div>{entry.username}</div>
              <div className="text-xs text-slate-600">
                {entry.reportsSubmitted} reports · {entry.reportsResolved} cleanups
              </div>
            </div>
            <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {entry.points} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}