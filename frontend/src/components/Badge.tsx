// Det här är en komponent för att visa en badge med react-icons
import { LuFilePen, LuSwords, LuUserRoundCheck } from "react-icons/lu"
import { SiOpenstreetmap } from "react-icons/si"
import { GiFallingStar, GiKnockedOutStars, GiFlame, GiLightningFlame, GiMagicBroom, GiNinjaHeroicStance, GiPlanetConquest } from "react-icons/gi"
import { RxRocket } from "react-icons/rx"
import { PiBroomBold, PiPlant } from "react-icons/pi"
import { RiRecycleFill } from "react-icons/ri"
import { HiOutlineTrophy } from "react-icons/hi2"
import { FaMagnifyingGlass, FaShieldCat, FaFireFlameCurved } from "react-icons/fa6"
import { IoGlassesOutline } from "react-icons/io5"
import { VscFlame } from "react-icons/vsc"
import { TbBeach } from "react-icons/tb"
import type { IconType } from "react-icons"

interface BadgeProps {
  label: string
}

// Mappar badge-text mot ikon och färg
const BADGE_ICONS: Record<string, { icon: IconType; color: string }> = {
  // Reports
  'First Report':       { icon: LuFilePen,           color: 'var(--color-green-dark)' },
  '5 Reports':          { icon: SiOpenstreetmap,      color: 'var(--color-green-dark)' },
  '10 Reports':         { icon: GiFallingStar,        color: '#eab308' },
  '50 Reports':         { icon: RxRocket,             color: 'var(--color-green-darker)' },
  // Cleanups
  'First Cleanup':      { icon: PiBroomBold,          color: 'var(--color-green-dark)' },
  '5 Cleanups':         { icon: RiRecycleFill,        color: 'var(--color-green-normal)' },
  '10 Cleanups':        { icon: HiOutlineTrophy,      color: '#eab308' },
  '50 Cleanups':        { icon: GiKnockedOutStars,    color: '#eab308' },
  // Verifications
  'First Verify':       { icon: LuUserRoundCheck,     color: 'var(--color-green-dark)' },
  '10 Verifications':   { icon: FaMagnifyingGlass,    color: 'var(--color-green-dark)' },
  '50 Verifications':   { icon: IoGlassesOutline,     color: 'var(--color-green-darker)' },
  '100 Verifications':  { icon: FaShieldCat,          color: 'var(--color-green-darker)' },
  // Streak — olika flamfärger
  '3 Day Streak':       { icon: FaFireFlameCurved,    color: '#f97316' },
  '7 Day Streak':       { icon: VscFlame,             color: '#ef4444' },
  '14 Day Streak':      { icon: GiFlame,              color: '#dc2626' },
  '30 Day Streak':      { icon: GiLightningFlame,     color: '#7c3aed' },
  // Milestones
  'Litter Spotter':     { icon: PiPlant,              color: 'var(--color-green-normal)' },
  'Street Cleaner':     { icon: GiMagicBroom,         color: 'var(--color-green-dark)' },
  'Eco Warrior':        { icon: LuSwords,             color: 'var(--color-green-darker)' },
  'Green Hero':         { icon: GiNinjaHeroicStance,  color: 'var(--color-green-dark)' },
  'Beach Hero':         { icon: TbBeach,              color: '#0ea5e9' },
  'Planet Guardian':    { icon: GiPlanetConquest,     color: '#7c3aed' },
}

const Badge = ({ label }: BadgeProps) => {
  // label är ren text från backend — ingen | splitting behövs längre
  const text = label
  const match = BADGE_ICONS[text]

  return (
    <div className="card flex flex-col items-center justify-center text-center gap-2 p-3" style={{ minHeight: '80px' }}>
      {match ? (
        <match.icon size={28} color={match.color} />
      ) : (
        <span className="text-2xl">🏅</span>
      )}
      <span className="text-body-sm font-medium text-text-primary">{text}</span>
    </div>
  )
}

export default Badge