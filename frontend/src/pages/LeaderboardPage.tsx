import { Leaderboard } from '../components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="md:pt-[74px]">
      {/* md: topp-nav — leaderboard innehåll under fixed header */}
      <Leaderboard />
    </div>
  );
}