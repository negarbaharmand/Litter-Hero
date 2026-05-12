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

  const topThreeEntries = [...entries]
    .sort((a, b) => a.rank - b.rank)
    .filter((entry) => entry.rank <= 3)
    .slice(0, 3);

  const remainingEntries = sortedEntries.filter((entry) => entry.rank > 3);

  return (
    <div className="leaderboard-table-container space-y-4">
      {topThreeEntries.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {topThreeEntries.map((entry) => (
            <div
              key={entry.id}
              className="min-w-36 flex-1 rounded-xl border border-gray-200 bg-white p-4 text-center"
            >
              <div className="mx-auto mb-2 w-fit">
                <ProfilePicture username={entry.username} profilePictureUrl={entry.profilePictureUrl} />
              </div>
              <div className="text-sm font-semibold text-[#1d4e2f]">{entry.username}</div>
              <div className="mt-1 text-sm font-medium text-[#1d4e2f]">{entry.points} pts</div>
              <div className="mt-2 inline-block rounded-full bg-[#3ea865] px-3 py-1 text-xs font-semibold text-white">
                #{entry.rank}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {remainingEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-lg p-4 hover:bg-gray-50 transition border border-gray-200"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 text-lg font-bold text-[#3ea865]">#{entry.rank}</div>
              <div>
                <ProfilePicture username={entry.username} profilePictureUrl={entry.profilePictureUrl} />
              </div>
              <div className="flex-1 text-[#1d4e2f]">{entry.username}</div>
              <div className="font-bold text-[#1d4e2f]">{entry.points} pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}