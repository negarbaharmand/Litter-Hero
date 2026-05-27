//Det här en komponent för att visa en poängkort
interface PointsCardProps {
  totalPoints: number;
  weeklyPoints: number;
  reportsCreated: number;
  cleanupsApproved: number;
  verificationVotes: number;
}

const PointsCard = ({
  totalPoints,
  weeklyPoints,
  reportsCreated,
  cleanupsApproved,
  verificationVotes,
}: PointsCardProps) => {
  return (
    <div className="mx-4 mt-6">
      <h2 className="mb-3!"> Your Impact</h2>
      <div className="card">
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3 lg:grid-cols-5">
          {/* Reports created */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">📋</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">
              {reportsCreated}
            </span>
            <span className="text-body-sm text-text-muted">Reports</span>
          </div>

          {/* Cleanups approved */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">🧹</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">
              {cleanupsApproved}
            </span>
            <span className="text-body-sm text-text-muted">Cleanups</span>
          </div>

          {/* Points */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">⭐</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">
              {totalPoints}
            </span>
            <span className="text-body-sm text-text-muted">Points</span>
          </div>

          {/* Verification votes */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">✓</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">
              {verificationVotes}
            </span>
            <span className="text-body-sm text-text-muted">Votes cast</span>
          </div>

          {/* Weekly */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">📈</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">
              +{weeklyPoints}
            </span>
            <span className="text-body-sm text-text-muted">This week</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsCard;
