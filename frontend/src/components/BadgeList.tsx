//Det här en komponent för att visa en LISTA av badges, som kan användas för att visa utmärkelser eller prestationer på användarprofilen
import Badge from './Badge'

interface BadgeListProps {
  badges: string[]
}

const BadgeList = ({ badges }: BadgeListProps) => {
  return (
    <div className="mx-4 mt-6">
      <h2 className="text-white font-semibold mb-3">🏆Utmärkelser🏆</h2>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge) => (
          <Badge key={badge} label={badge} />
        ))}
      </div>
    </div>
  )
}

export default BadgeList