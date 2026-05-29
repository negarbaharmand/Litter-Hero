// Det här är en komponent som visar nästa poängmilstolpe och progress mot den
import { PiPlant } from "react-icons/pi";
import {
  GiMagicBroom,
  GiNinjaHeroicStance,
  GiPlanetConquest,
} from "react-icons/gi";
import { LuSwords } from "react-icons/lu";
import { TbBeach } from "react-icons/tb";
import type { IconType } from "react-icons";

interface MilestoneCardProps {
  currentPoints: number;
}

const MILESTONES: { points: number; label: string; icon: IconType; gradient: string; pillBg: string }[] = [
  { points: 100,  label: "Litter Spotter",  icon: PiPlant,             gradient: 'linear-gradient(135deg, #65a30d, #84cc16)', pillBg: '#65a30d' },
  { points: 250,  label: "Street Cleaner",  icon: GiMagicBroom,        gradient: 'linear-gradient(135deg, #ca8a04, #eab308)', pillBg: '#ca8a04' },
  { points: 500,  label: "Eco Warrior",     icon: LuSwords,            gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', pillBg: '#d97706' },
  { points: 1000, label: "Green Hero",      icon: GiNinjaHeroicStance, gradient: 'linear-gradient(135deg, #006045, #3ea865)', pillBg: '#006045' },
  { points: 2500, label: "Beach Hero",      icon: TbBeach,             gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)', pillBg: '#0284c7' },
  { points: 5000, label: "Planet Guardian", icon: GiPlanetConquest,    gradient: 'linear-gradient(135deg, #6d28d9, #0891b2)', pillBg: '#6d28d9' },
];

const MilestoneCard = ({ currentPoints }: MilestoneCardProps) => {
  // Hitta nästa milstolpe som inte nåtts än
  const next = MILESTONES.find((m) => m.points > currentPoints);

  // Alla milstolpar nådda
  if (!next) {
    return (
      <div className="mx-4 mt-6">
        <h3 className="mb-3!">Motivation</h3>
        <div className="card flex flex-col gap-2">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            🌍 All milestones reached!
          </p>
        </div>
      </div>
    );
  }

  // Hitta föregående milstolpe för korrekt progress
  const prevPoints =
    MILESTONES.filter((m) => m.points <= currentPoints).at(-1)?.points ?? 0;
  const range = next.points - prevPoints;
  const progress = currentPoints - prevPoints;
  const percentage = Math.round((progress / range) * 100);
  const remaining = next.points - currentPoints;
  const IconComponent = next.icon;

  return (
    <div className="mx-4 mt-6">
      <h3 className="mb-3!">Motivation</h3>
      <div className="card flex flex-col gap-3">
        {/* Next milestone header + pill */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            Next Milestone
          </span>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1"
            style={{
              background: next.gradient,
              color: "white",
              boxShadow: `0 2px 8px ${next.pillBg}55`,
              whiteSpace: 'nowrap',
            }}
          >
            <IconComponent size={13} color="#fff" />
            {next.label}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-border)", height: 10 }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percentage}%`,
              background: next.gradient,
            }}
          />
        </div>

        {/* Progress text */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {progress} / {range} pts
          </span>
          <span
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: next.pillBg }}
          >
            {remaining} to go! <IconComponent size={13} color={next.pillBg} />
          </span>
        </div>

        <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
          Unlock "{next.label}" at {next.points} points
        </p>
      </div>
    </div>
  );
};

export default MilestoneCard;
