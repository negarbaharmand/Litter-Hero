//Det här en komponent för att visa en LISTA av badges, som kan användas för att visa utmärkelser eller prestationer på användarprofilen
import Badge from './Badge'

interface BadgeItem {
  id: number
  label: string
}

interface BadgeListProps {
  badges: BadgeItem[]
}

const BadgeList = ({ badges }: BadgeListProps) => {
  return (
    <div className="mx-4 mt-6">
      <h2 className="font-semibold mb-3" style={{ color: '#111827', fontFamily: "'Noto Sans', sans-serif" }}>Awards</h2>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge) => (
          <Badge key={badge.id} label={badge.label} />
        ))}
      </div>
    </div>
  )
}

export default BadgeList