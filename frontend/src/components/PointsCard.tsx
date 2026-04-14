//Det här en komponent för att visa en poängkort, som kan användas för att visa användarens totala poäng och veckovisa poängökning
interface PointsCardProps {
  totalPoints: number
  weeklyPoints: number
}

const PointsCard = ({ totalPoints, weeklyPoints }: PointsCardProps) => {
  return (
    <div className="bg-surface rounded-2xl p-6 mx-4 text-center">
      <span className="text-muted text-sm">Totala poäng</span>
      <p className="text-white text-5xl font-bold my-2">{totalPoints}</p>
      <div className="flex items-center justify-center gap-1 text-primary text-sm">
        <span>↗</span>
        <span>+{weeklyPoints} denna vecka</span>
      </div>
    </div>
  )
}

export default PointsCard