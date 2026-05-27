// Det här är en komponent som visar nästa poängmilstolpe och progress mot den
import { PiPlant } from "react-icons/pi"
import { GiMagicBroom, GiNinjaHeroicStance, GiPlanetConquest } from "react-icons/gi"
import { LuSwords } from "react-icons/lu"
import { TbBeach } from "react-icons/tb"
import type { IconType } from "react-icons"

interface MilestoneCardProps {
  currentPoints: number
}

// Milstolpar med react-icons — beräknas enbart från user.points, ingen backend-koppling
const MILESTONES: { points: number; label: string; icon: IconType; color: string }[] = [
  { points: 100,  label: 'Litter Spotter', icon: PiPlant,             color: 'var(--color-green-normal)' },
  { points: 250,  label: 'Street Cleaner', icon: GiMagicBroom,        color: 'var(--color-green-dark)' },
  { points: 500,  label: 'Eco Warrior',    icon: LuSwords,            color: 'var(--color-green-darker)' },
  { points: 1000, label: 'Green Hero',     icon: GiNinjaHeroicStance, color: 'var(--color-green-dark)' },
  { points: 2500, label: 'Beach Hero',     icon: TbBeach,             color: '#0ea5e9' },
  { points: 5000, label: 'Planet Guardian',icon: GiPlanetConquest,    color: '#7c3aed' },
]

const MilestoneCard = ({ currentPoints }: MilestoneCardProps) => {
  // Hitta nästa milstolpe som inte nåtts än
  const next = MILESTONES.find((m) => m.points > currentPoints)

  // Alla milstolpar nådda
  if (!next) {
    return (
      <div className="mx-4 mt-6">
        <h3 className="mb-3!">Motivation</h3>
        <div className="card flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            🌍 All milestones reached!
          </p>
        </div>
      </div>
    )
  }

  // Hitta föregående milstolpe för korrekt progress
  const prevPoints = MILESTONES.filter((m) => m.points <= currentPoints).at(-1)?.points ?? 0
  const range = next.points - prevPoints
  const progress = currentPoints - prevPoints
  const percentage = Math.round((progress / range) * 100)
  const remaining = next.points - currentPoints
  const IconComponent = next.icon

  return (
    <div className="mx-4 mt-6">
      <h3 className="mb-3!">Motivation</h3>
      <div className="card flex flex-col gap-3">

        {/* Rubrik + badge-pill med ikon */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Next Milestone
          </span>
          <span
            className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1"
            style={{ backgroundColor: 'var(--color-green-normal)', color: '#fff' }}
          >
            <IconComponent size={14} color="#fff" />
            {next.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-page-bg)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: 'var(--color-green-normal)' }}
          />
        </div>

        {/* Progress text + remaining med ikon */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
            {progress} / {range} points in this tier
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {remaining} to go! <IconComponent size={14} color={next.color} />
          </span>
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--color-text-primary)' }}>
          Reach {next.points} total points to earn "{next.label}"
        </p>

      </div>
    </div>
  )
}

export default MilestoneCard