import { type LeaderboardEntry } from './LeaderboardTypes';
import ProfilePicture from './leaderboardAvatar';
<<<<<<< HEAD

=======
>>>>>>> origin/main
interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sortBy: 'rank' | 'points' | 'username';
  onSortChange: (sortBy: 'rank' | 'points' | 'username') => void;
}

export function LeaderboardTable({ entries, sortBy }: LeaderboardTableProps) {
<<<<<<< HEAD
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
              {entry.username}
            </div>
            <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {entry.points} pts
            </div>
          </div>
        ))}
      </div>
=======
  // Sortera entries baserat på sortBy prop
  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.rank - b.rank; // lägast rank först
      case 'points':
        return b.points - a.points; // högst poäng först
      case 'username':
        return a.username.localeCompare(b.username); // Alphabetisk ordning
      default:
        return 0;
    }
  });

  return (
    <div className="leaderboard-table-container space-y-3">
      {sortedEntries.map((entry) => (
        <div
          key={entry.id}
          className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition border border-slate-700"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="font-bold text-lg w-12">
              {entry.rank === 1 && '🥇'}
              {entry.rank === 2 && '🥈'}
              {entry.rank === 3 && '🥉'}
              {entry.rank > 3 && <span className="text-emerald-300">#{entry.rank}</span>}
            </div>
            <div>
            <ProfilePicture username= {entry.username} profilePictureUrl={entry.profilePictureUrl}/>
            </div>
            <div className="flex-1 text-slate-100">{entry.username}</div>
            <div className="text-yellow-400 font-bold">{entry.points} pts</div>
            <div className="text-emerald-400 text-sm w-20">
              📝 {entry.reportsSubmitted}
            </div>
            <div className="text-green-400 text-sm w-20">
              ✓ {entry.reportsResolved}
            </div>
          </div>
        </div>
      ))}
>>>>>>> origin/main
    </div>
  );
}