// Shared badge configuration and SVG frame component
// Used by both Badge.tsx (small, in grid) and BadgeCelebration.tsx (large, modal)

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

export type BadgeShape = 'hex' | 'shield' | 'diamond'
export type BadgeTier  = 'common' | 'rare' | 'epic' | 'legendary' | 'streak'

export interface BadgeConfig {
  icon:   IconType
  from:   string
  to:     string
  border: string
  glow:   string
  shape:  BadgeShape
  tier:   BadgeTier
}

export const TIER_META: Record<BadgeTier, { stars: number; dotColor: string; animClass: string; label: string }> = {
  common:    { stars: 1, dotColor: '#9ca3af', animClass: 'bdg-breathe',   label: 'Common' },
  rare:      { stars: 2, dotColor: '#60a5fa', animClass: 'bdg-breathe',   label: 'Rare' },
  epic:      { stars: 3, dotColor: '#fbbf24', animClass: 'bdg-breathe',   label: 'Epic' },
  streak:    { stars: 2, dotColor: '#f97316', animClass: 'bdg-fire',      label: 'Streak' },
  legendary: { stars: 3, dotColor: '#c084fc', animClass: 'bdg-legendary', label: 'Legendary' },
}

export const BADGE_CONFIG: Record<string, BadgeConfig> = {
  // Reports — blue/indigo, hexagon
  'First Report':      { icon: LuFilePen,          from: '#60a5fa', to: '#1d4ed8', border: '#1e3a8a', glow: '#3b82f6', shape: 'hex',     tier: 'common' },
  '5 Reports':         { icon: SiOpenstreetmap,     from: '#818cf8', to: '#4338ca', border: '#312e81', glow: '#6366f1', shape: 'hex',     tier: 'rare' },
  '10 Reports':        { icon: GiFallingStar,       from: '#38bdf8', to: '#0284c7', border: '#075985', glow: '#0ea5e9', shape: 'hex',     tier: 'rare' },
  '50 Reports':        { icon: RxRocket,            from: '#c084fc', to: '#7c3aed', border: '#4c1d95', glow: '#a855f7', shape: 'hex',     tier: 'epic' },
  // Cleanups — emerald/gold, hexagon
  'First Cleanup':     { icon: PiBroomBold,         from: '#4ade80', to: '#15803d', border: '#14532d', glow: '#22c55e', shape: 'hex',     tier: 'common' },
  '5 Cleanups':        { icon: RiRecycleFill,       from: '#34d399', to: '#047857', border: '#064e3b', glow: '#10b981', shape: 'hex',     tier: 'rare' },
  '10 Cleanups':       { icon: HiOutlineTrophy,     from: '#fcd34d', to: '#d97706', border: '#b45309', glow: '#f59e0b', shape: 'hex',     tier: 'rare' },
  '50 Cleanups':       { icon: GiKnockedOutStars,   from: '#fde68a', to: '#ca8a04', border: '#a16207', glow: '#eab308', shape: 'hex',     tier: 'epic' },
  // Verifications — purple/violet, hexagon
  'First Verify':      { icon: LuUserRoundCheck,    from: '#c084fc', to: '#7c3aed', border: '#6d28d9', glow: '#8b5cf6', shape: 'hex',     tier: 'common' },
  '10 Verifications':  { icon: FaMagnifyingGlass,   from: '#e879f9', to: '#9333ea', border: '#7e22ce', glow: '#a855f7', shape: 'hex',     tier: 'rare' },
  '50 Verifications':  { icon: IoGlassesOutline,    from: '#a78bfa', to: '#5b21b6', border: '#4c1d95', glow: '#7c3aed', shape: 'hex',     tier: 'epic' },
  '100 Verifications': { icon: FaShieldCat,         from: '#f0abfc', to: '#9333ea', border: '#701a75', glow: '#d946ef', shape: 'shield',  tier: 'legendary' },
  // Streaks — fire, diamond shape
  '3 Day Streak':      { icon: FaFireFlameCurved,   from: '#fb923c', to: '#c2410c', border: '#9a3412', glow: '#f97316', shape: 'diamond', tier: 'streak' },
  '7 Day Streak':      { icon: VscFlame,            from: '#f87171', to: '#dc2626', border: '#991b1b', glow: '#ef4444', shape: 'diamond', tier: 'streak' },
  '14 Day Streak':     { icon: GiFlame,             from: '#fca5a5', to: '#b91c1c', border: '#7f1d1d', glow: '#dc2626', shape: 'diamond', tier: 'streak' },
  '30 Day Streak':     { icon: GiLightningFlame,    from: '#d8b4fe', to: '#7c3aed', border: '#5b21b6', glow: '#a855f7', shape: 'diamond', tier: 'streak' },
  // Milestones — shield shape
  'Litter Spotter':    { icon: PiPlant,             from: '#86efac', to: '#15803d', border: '#14532d', glow: '#22c55e', shape: 'shield',  tier: 'common' },
  'Street Cleaner':    { icon: GiMagicBroom,        from: '#fde68a', to: '#ca8a04', border: '#a16207', glow: '#eab308', shape: 'shield',  tier: 'rare' },
  'Eco Warrior':       { icon: LuSwords,            from: '#fcd34d', to: '#b45309', border: '#92400e', glow: '#f59e0b', shape: 'shield',  tier: 'rare' },
  'Green Hero':        { icon: GiNinjaHeroicStance, from: '#34d399', to: '#065f46', border: '#064e3b', glow: '#10b981', shape: 'shield',  tier: 'epic' },
  'Beach Hero':        { icon: TbBeach,             from: '#7dd3fc', to: '#0369a1', border: '#075985', glow: '#0ea5e9', shape: 'shield',  tier: 'epic' },
  'Planet Guardian':   { icon: GiPlanetConquest,    from: '#818cf8', to: '#0891b2', border: '#155e75', glow: '#06b6d4', shape: 'shield',  tier: 'legendary' },
}

// ── SVG shape data ────────────────────────────────────────────────

const HEX_OUTER   = "50,2 94,26 94,74 50,98 6,74 6,26"
const HEX_INNER   = "50,7 89,29 89,71 50,93 11,71 11,29"
const HEX_SHINE   = "50,7 89,29 89,52 50,52 11,52 11,29"

const SHIELD_OUTER = "M50,4 L96,24 L96,64 Q96,88 50,96 Q4,88 4,64 L4,24 Z"
const SHIELD_INNER = "M50,9 L91,27 L91,63 Q91,83 50,91 Q9,83 9,63 L9,27 Z"
const SHIELD_SHINE = "M50,9 L91,27 L91,50 L9,50 L9,27 Z"

const DIAMOND_OUTER = "50,2 98,50 50,98 2,50"
const DIAMOND_INNER = "50,8 92,50 50,92 8,50"
const DIAMOND_SHINE = "50,8 92,50 50,50 8,50"

export interface SvgFrameProps {
  shape:  BadgeShape
  from:   string
  to:     string
  border: string
  uid:    string
  size?:  number
}

export const SvgFrame = ({ shape, from, to, border, uid, size = 72 }: SvgFrameProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
    <defs>
      <linearGradient id={`bg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
      <linearGradient id={`sh-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>

    {shape === 'hex' && (
      <>
        <polygon points={HEX_OUTER} fill={border} />
        <polygon points={HEX_INNER} fill={`url(#bg-${uid})`} />
        <polygon points={HEX_SHINE} fill={`url(#sh-${uid})`} />
        <circle cx="30" cy="24" r="5" fill="rgba(255,255,255,0.22)" />
      </>
    )}
    {shape === 'shield' && (
      <>
        <path d={SHIELD_OUTER} fill={border} />
        <path d={SHIELD_INNER} fill={`url(#bg-${uid})`} />
        <path d={SHIELD_SHINE} fill={`url(#sh-${uid})`} />
        <circle cx="30" cy="26" r="5" fill="rgba(255,255,255,0.22)" />
      </>
    )}
    {shape === 'diamond' && (
      <>
        <polygon points={DIAMOND_OUTER} fill={border} />
        <polygon points={DIAMOND_INNER} fill={`url(#bg-${uid})`} />
        <polygon points={DIAMOND_SHINE} fill={`url(#sh-${uid})`} />
        <circle cx="34" cy="34" r="5" fill="rgba(255,255,255,0.22)" />
      </>
    )}
  </svg>
)
