//Det här en komponent för att visa en poängkort, som kan användas för att visa användarens totala poäng och veckovisa poängökning
interface PointsCardProps {
  totalPoints: number
  weeklyPoints: number
}

const PointsCard = ({ totalPoints, weeklyPoints }: PointsCardProps) => {
  return (
    <div className="rounded-2xl p-6 mx-4 text-center" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', fontFamily: "'Noto Sans', sans-serif" }}>
      <span className="text-sm" style={{ color: '#6b7280' }}>Total points</span>
      <p className="text-5xl font-bold my-2" style={{ color: '#111827' }}>{totalPoints}</p>
      <div className="flex items-center justify-center gap-1 text-sm" style={{ color: '#4ade80' }}>
        <span>↗</span>
        <span>+{weeklyPoints} This week</span>
      </div>
    </div>
  )
}

export default PointsCard