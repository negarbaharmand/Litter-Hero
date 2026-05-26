// Det här är en komponent som visar nästa poängmilstolpe och progress mot den
interface MilestoneCardProps {
  currentPoints: number
}

// Milstolpar med tillhörande badge-namn
const MILESTONES = [
  { points: 100, badge: 'Litter Spotter' },
  { points: 250, badge: 'Street Cleaner' },
  { points: 500, badge: 'Eco Warrior' },
  { points: 1000, badge: 'Green Hero' },
  { points: 2500, badge: 'Beach Hero' },
  { points: 5000, badge: 'Planet Guardian' },
]

const MilestoneCard = ({ currentPoints }: MilestoneCardProps) => {
  // Hitta nästa milstolpe som användaren inte nått än
  const next = MILESTONES.find((m) => m.points > currentPoints)

  // Om alla milstolpar är nådda
  if (!next) {
    return (
      <div className="mx-4 mt-6">
        <h3 className="mb-3!">Motivation</h3>
        <div className="card flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            🏆 All milestones reached!
          </p>
        </div>
      </div>
    )
  }

  // Hitta föregående milstolpe för att beräkna progress korrekt
  const prevPoints = MILESTONES.filter((m) => m.points <= currentPoints).at(-1)?.points ?? 0
  const range = next.points - prevPoints
  const progress = currentPoints - prevPoints
  const percentage = Math.round((progress / range) * 100)
  const remaining = next.points - currentPoints

  return (
    <div className="mx-4 mt-6">
      <h3 className="mb-3!">Motivation</h3>
      <div className="card flex flex-col gap-3">

        {/* Rubrik + grön pill */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Next Milestone
          </span>
          <span
            className="text-xs font-semibold rounded-full px-3 py-1"
            style={{ backgroundColor: 'var(--color-green-normal)', color: '#fff' }}
          >
            {next.badge}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-page-bg)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: 'var(--color-green-normal)' }}
          />
        </div>

        {/* Points text + remaining */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
            {currentPoints} / {next.points} points
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {remaining} to go! 🏆
          </span>
        </div>

        {/* Unlock text */}
        <p className="text-xs text-center" style={{ color: 'var(--color-text-primary)' }}>
          Unlock "{next.badge}" badge at {next.points} points
        </p>

      </div>
    </div>
  )
}

export default MilestoneCard