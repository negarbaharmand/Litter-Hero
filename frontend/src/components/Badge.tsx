import { BADGE_CONFIG, TIER_META, SvgFrame } from './badgeFrames'

interface BadgeProps {
  label: string
}

const Badge = ({ label }: BadgeProps) => {
  const config = BADGE_CONFIG[label]

  if (!config) {
    return (
      <div className="card flex flex-col items-center justify-center text-center gap-2 p-3" style={{ minHeight: '96px' }}>
        <span className="text-3xl">🏅</span>
        <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
      </div>
    )
  }

  const { icon: Icon, from, to, border, glow, shape, tier } = config
  const { stars, dotColor, animClass } = TIER_META[tier]
  const uid = label.replace(/[^a-z0-9]/gi, '-').toLowerCase()

  return (
    <div
      className="flex flex-col items-center gap-1 text-center rounded-[var(--radius-card)] p-2"
      style={{ background: 'var(--color-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
    >
      <div
        className={animClass}
        style={{ position: 'relative', width: 72, height: 72, '--bdg': `${glow}99` } as React.CSSProperties}
      >
        <SvgFrame shape={shape} from={from} to={to} border={border} uid={uid} size={72} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={28} color="#fff" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }} />
        </div>
      </div>

      <div className="flex gap-1 items-center">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < stars ? dotColor : 'var(--color-border)',
              display: 'inline-block',
            }}
          />
        ))}
      </div>

      <span className="text-xs font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </span>
    </div>
  )
}

export default Badge
