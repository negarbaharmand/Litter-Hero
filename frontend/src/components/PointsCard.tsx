// Det här är en komponent för att visa användarens poängstatistik
// Tre kort på rad: Reports, Points, Rank — sedan cleanups som lista under
interface PointsCardProps {
  totalPoints: number;
  weeklyPoints: number;
  reportsCreated: number;
  cleanupsApproved: number;
  verificationVotes: number;
  rank: number | null;
}

const PointsCard = ({
  totalPoints,
  reportsCreated,
  cleanupsApproved,
  rank,
}: PointsCardProps) => {
  return (
    <div className="mx-4 mt-6 flex flex-col gap-3">
      <h3 className="mb-3!">Your Impact</h3>

      {/* Tre kort på rad — Reports, Points, Rank */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card flex flex-col items-center gap-1 py-4 px-2 text-center">
          <span className="text-2xl" aria-hidden="true">📋</span>
          <span className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>{reportsCreated}</span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Reports</span>
        </div>
        <div className="card flex flex-col items-center gap-1 py-4 px-2 text-center">
          <span className="text-2xl" aria-hidden="true">⭐</span>
          <span className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>{totalPoints}</span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Points</span>
        </div>
        <div className="card flex flex-col items-center gap-1 py-4 px-2 text-center">
          <span className="text-2xl" aria-hidden="true">🏆</span>
          <span className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
            {rank !== null ? `#${rank}` : "—"}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Rank</span>
        </div>
      </div>

      {/* Cleanups-lista under korten */}
      <div className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>Clean-ups completed</span>
          <span className="font-bold text-sm" style={{ color: "var(--color-green-dark)" }}>{cleanupsApproved}</span>
        </div>
      </div>
    </div>
  );
};

export default PointsCard;
