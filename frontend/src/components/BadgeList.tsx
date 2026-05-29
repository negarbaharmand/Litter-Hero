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
      <h3 className="mb-3!">Achievements</h3>
      {badges.length === 0 ? (
        <div
          className="card flex flex-col items-center justify-center gap-2 py-6 text-center"
        >
          <span className="text-3xl" aria-hidden="true">🎖️</span>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            No badges yet
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Report litter, verify cleanups, and keep your streak going to earn your first badge!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <Badge key={badge.id} label={badge.label} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BadgeList