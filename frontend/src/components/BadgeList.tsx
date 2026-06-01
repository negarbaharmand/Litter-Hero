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
        <div className="card flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            🎖️
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            No badges yet
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Report litter, verify cleanups, and keep your streak going to earn your first badge!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {badges.map((badge) => (
            <Badge key={badge.id} label={badge.label} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BadgeList