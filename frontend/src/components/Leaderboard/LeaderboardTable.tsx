import { type LeaderboardEntry } from './LeaderboardTypes';
import ProfilePicture from './leaderboardAvatar';
interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sortBy: 'rank' | 'points' | 'username';
  onSortChange: (sortBy: 'rank' | 'points' | 'username') => void;
}

export function LeaderboardTable({ entries, sortBy }: LeaderboardTableProps) {
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
    </div>
  );
}