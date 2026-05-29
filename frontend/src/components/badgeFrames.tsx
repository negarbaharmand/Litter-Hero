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
  // Reports — lime green (energetic, spotting litter)
  'First Report':      { icon: LuFilePen,          from: '#d9f99d', to: '#65a30d', border: '#4d7c0f', glow: '#84cc16', shape: 'hex',     tier: 'common' },
  '5 Reports':         { icon: SiOpenstreetmap,     from: '#bef264', to: '#4d7c0f', border: '#3f6212', glow: '#65a30d', shape: 'hex',     tier: 'rare' },
  '10 Reports':        { icon: GiFallingStar,       from: '#a3e635', to: '#3f6212', border: '#365314', glow: '#4d7c0f', shape: 'hex',     tier: 'rare' },
  '50 Reports':        { icon: RxRocket,            from: '#84cc16', to: '#365314', border: '#1a2e05', glow: '#3f6212', shape: 'hex',     tier: 'epic' },
  // Cleanups — emerald → gold for higher tiers (nature restored, then achievement)
  'First Cleanup':     { icon: PiBroomBold,         from: '#4ade80', to: '#15803d', border: '#14532d', glow: '#22c55e', shape: 'hex',     tier: 'common' },
  '5 Cleanups':        { icon: RiRecycleFill,       from: '#34d399', to: '#047857', border: '#064e3b', glow: '#10b981', shape: 'hex',     tier: 'rare' },
  '10 Cleanups':       { icon: HiOutlineTrophy,     from: '#fcd34d', to: '#d97706', border: '#b45309', glow: '#f59e0b', shape: 'hex',     tier: 'rare' },
  '50 Cleanups':       { icon: GiKnockedOutStars,   from: '#fde68a', to: '#ca8a04', border: '#a16207', glow: '#eab308', shape: 'hex',     tier: 'epic' },
  // Verifications — amber/gold (trusted, confirmed, official)
  'First Verify':      { icon: LuUserRoundCheck,    from: '#fde68a', to: '#d97706', border: '#b45309', glow: '#f59e0b', shape: 'hex',     tier: 'common' },
  '10 Verifications':  { icon: FaMagnifyingGlass,   from: '#fcd34d', to: '#b45309', border: '#92400e', glow: '#d97706', shape: 'hex',     tier: 'rare' },
  '50 Verifications':  { icon: IoGlassesOutline,    from: '#fbbf24', to: '#92400e', border: '#78350f', glow: '#b45309', shape: 'hex',     tier: 'epic' },
  '100 Verifications': { icon: FaShieldCat,         from: '#fef08a', to: '#a16207', border: '#854d0e', glow: '#ca8a04', shape: 'shield',  tier: 'legendary' },
  // Streaks — fire (passion and dedication, universal)
  '3 Day Streak':      { icon: FaFireFlameCurved,   from: '#fb923c', to: '#c2410c', border: '#9a3412', glow: '#f97316', shape: 'diamond', tier: 'streak' },
  '7 Day Streak':      { icon: VscFlame,            from: '#f87171', to: '#dc2626', border: '#991b1b', glow: '#ef4444', shape: 'diamond', tier: 'streak' },
  '14 Day Streak':     { icon: GiFlame,             from: '#fca5a5', to: '#b91c1c', border: '#7f1d1d', glow: '#dc2626', shape: 'diamond', tier: 'streak' },
  '30 Day Streak':     { icon: GiLightningFlame,    from: '#fdba74', to: '#c2410c', border: '#9a3412', glow: '#f97316', shape: 'diamond', tier: 'streak' },
  // Milestones — shield shape, deep nature greens & ocean teals
  'Litter Spotter':    { icon: PiPlant,             from: '#86efac', to: '#15803d', border: '#14532d', glow: '#22c55e', shape: 'shield',  tier: 'common' },
  'Street Cleaner':    { icon: GiMagicBroom,        from: '#34d399', to: '#0f766e', border: '#134e4a', glow: '#0d9488', shape: 'shield',  tier: 'rare' },
  'Eco Warrior':       { icon: LuSwords,            from: '#4ade80', to: '#065f46', border: '#064e3b', glow: '#10b981', shape: 'shield',  tier: 'rare' },
  'Green Hero':        { icon: GiNinjaHeroicStance, from: '#22c55e', to: '#14532d', border: '#052e16', glow: '#16a34a', shape: 'shield',  tier: 'epic' },
  'Beach Hero':        { icon: TbBeach,             from: '#34d399', to: '#0f766e', border: '#134e4a', glow: '#0d9488', shape: 'shield',  tier: 'epic' },
  'Planet Guardian':   { icon: GiPlanetConquest,    from: '#4ade80', to: '#052e16', border: '#14532d', glow: '#16a34a', shape: 'shield',  tier: 'legendary' },
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
