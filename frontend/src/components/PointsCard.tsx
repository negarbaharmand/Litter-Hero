<<<<<<< HEAD
//Det här en komponent för att visa en poängkort
=======
//Det här en komponent för att visa en poängkort, som kan användas för att visa användarens totala poäng och veckovisa poängökning
>>>>>>> origin/main
interface PointsCardProps {
  totalPoints: number
  weeklyPoints: number
}

const PointsCard = ({ totalPoints, weeklyPoints }: PointsCardProps) => {
  return (
<<<<<<< HEAD
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
=======
    <div className="bg-surface rounded-2xl p-6 mx-4 text-center">
      <span className="text-muted text-sm">Total points</span>
      <p className="text-white text-5xl font-bold my-2">{totalPoints}</p>
      <div className="flex items-center justify-center gap-1 text-primary text-sm">
        <span>↗</span>
        <span>+{weeklyPoints} This week</span>
>>>>>>> origin/main
      </div>
    </div>
  )
}

export default PointsCard