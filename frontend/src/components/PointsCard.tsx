//Det här en komponent för att visa en poängkort
interface PointsCardProps {
  totalPoints: number
  weeklyPoints: number
}

const PointsCard = ({ totalPoints, weeklyPoints }: PointsCardProps) => {
  return (
    <div className="mx-4 mt-6">
      <h3 className="mb-3!" > Your Impact</h3>
      <div className="card">
        <div className="flex justify-around text-center">
          {/* Reports — placeholder */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">📋</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">–</span>
            <span className="text-body-sm text-text-muted">Reports</span>
          </div>

          {/* Points */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">⭐</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">{totalPoints}</span>
            <span className="text-body-sm text-text-muted">Points</span>
          </div>

          {/* Weekly */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center mb-1">
              <span className="text-xl">📈</span>
            </div>
            <span className="font-bold text-body-lg text-text-primary">+{weeklyPoints}</span>
            <span className="text-body-sm text-text-muted">This week</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PointsCard