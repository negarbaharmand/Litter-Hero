import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { BADGE_CONFIG, TIER_META, SvgFrame } from './badgeFrames'

interface BadgeCelebrationProps {
  badges: string[]
  onDismiss: () => void
}

function fireConfetti(glowColor: string) {
  const colors = ['#53e086', '#fbbf24', glowColor, '#ffffff', '#a855f7']

  // Center burst
  confetti({ particleCount: 90, spread: 110, origin: { x: 0.5, y: 0.55 }, colors, startVelocity: 35 })

  // Side cannons
  setTimeout(() => {
    confetti({ angle: 58,  spread: 65, particleCount: 55, origin: { x: 0,   y: 0.65 }, colors })
    confetti({ angle: 122, spread: 65, particleCount: 55, origin: { x: 1,   y: 0.65 }, colors })
  }, 250)

  // Second pulse from centre
  setTimeout(() => {
    confetti({ particleCount: 45, spread: 90, origin: { x: 0.5, y: 0.5 }, colors, gravity: 0.7 })
  }, 550)
}

const BadgeCelebration = ({ badges, onDismiss }: BadgeCelebrationProps) => {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'in' | 'idle' | 'out'>('in')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const label  = badges[index]
  const config = BADGE_CONFIG[label]
  const tier   = TIER_META[config?.tier ?? 'common']
  const uid    = `celebrate-${label?.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`

  // Fire confetti whenever we enter a new badge
  useEffect(() => {
    if (config) {
      // slight delay so the badge pop animation has started
      const t = setTimeout(() => fireConfetti(config.glow), 150)
      return () => clearTimeout(t)
    }
  }, [index, config])

  // Animate in on mount / index change
  useEffect(() => {
    setPhase('in')
    timerRef.current = setTimeout(() => setPhase('idle'), 600)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index])

  function advance() {
    if (index < badges.length - 1) {
      setPhase('out')
      setTimeout(() => {
        setIndex(i => i + 1)
        setPhase('in')
      }, 260)
    } else {
      setPhase('out')
      setTimeout(onDismiss, 260)
    }
  }

  if (!config) return null

  const { icon: Icon, from, to, border, glow, shape } = config
  const { stars, dotColor, animClass, label: tierLabel } = tier

  const isIn  = phase === 'in'
  const isOut = phase === 'out'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Achievement Unlocked: ${label}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: isOut ? 'cel-fade-out 0.25s ease forwards' : 'cel-fade-in 0.25s ease forwards',
        padding: '24px',
      }}
      onClick={advance}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          maxWidth: 340,
          width: '100%',
          animation: isIn ? 'cel-card-in 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards' : undefined,
          opacity: isOut ? 0 : undefined,
          transition: isOut ? 'opacity 0.25s ease' : undefined,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* "Achievement Unlocked" header */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#fbbf24',
              marginBottom: 6,
              animation: 'cel-slide-down 0.4s 0.2s ease both',
            }}
          >
            ✦ Achievement Unlocked ✦
          </p>
          <p
            className="cel-tier-pill"
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: dotColor,
              border: `1.5px solid ${dotColor}55`,
              borderRadius: 999,
              padding: '2px 10px',
              animation: 'cel-slide-down 0.4s 0.3s ease both',
            }}
          >
            {tierLabel}
          </p>
        </div>

        {/* Badge frame — large, with expanding ring */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Expanding glow rings */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 160,
                height: 160,
                borderRadius: '50%',
                border: `2px solid ${glow}`,
                animation: `cel-ring 1.8s ${i * 0.4}s ease-out infinite`,
                pointerEvents: 'none',
              }}
            />
          ))}

          <div
            className={animClass}
            style={{
              position: 'relative',
              width: 160,
              height: 160,
              '--bdg': `${glow}cc`,
              animation: `${animClass === 'bdg-fire' ? 'bdg-fire' : animClass === 'bdg-legendary' ? 'bdg-legendary' : 'bdg-breathe'} ${animClass === 'bdg-fire' ? '1.6s' : '3.5s'} ease-in-out infinite, cel-badge-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both`,
            } as React.CSSProperties}
          >
            <SvgFrame shape={shape} from={from} to={to} border={border} uid={uid} size={160} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={64} color="#fff" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.55))' }} />
            </div>
          </div>
        </div>

        {/* Rarity stars */}
        <div style={{ display: 'flex', gap: 8, animation: 'cel-slide-up 0.4s 0.35s ease both' }}>
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: 18,
                filter: i < stars ? `drop-shadow(0 0 6px ${dotColor})` : 'none',
                opacity: i < stars ? 1 : 0.2,
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Badge name */}
        <div style={{ textAlign: 'center', animation: 'cel-slide-up 0.4s 0.4s ease both' }}>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, textShadow: `0 0 20px ${glow}` }}>
            {label}
          </p>
        </div>

        {/* CTA button */}
        <button
          onClick={advance}
          style={{
            marginTop: 4,
            padding: '14px 40px',
            borderRadius: 999,
            border: 'none',
            background: `linear-gradient(135deg, ${from}, ${to})`,
            color: '#fff',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${glow}88`,
            animation: 'cel-slide-up 0.4s 0.5s ease both',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 28px ${glow}bb`
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = ''
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${glow}88`
          }}
        >
          {index < badges.length - 1 ? `Next (${index + 1}/${badges.length})` : '🎉 Awesome!'}
        </button>

        {/* Tap-anywhere hint */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', animation: 'cel-slide-up 0.4s 0.7s ease both', marginTop: -8 }}>
          Tap anywhere to dismiss
        </p>
      </div>
    </div>
  )
}

export default BadgeCelebration
