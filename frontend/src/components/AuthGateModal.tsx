import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

type AuthGateModalProps = {
  open: boolean
  message: string
  onDismiss: () => void
}

export function AuthGateModal({ open, message, onDismiss }: AuthGateModalProps) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const prev = document.activeElement as HTMLElement | null
    const focusable = dialogRef.current?.querySelector<HTMLElement>('button')
    focusable?.focus()
    return () => {
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button')
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onDismiss])

  if (!open) return null

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="auth-gate-title"
          className="text-lg font-semibold text-center"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {message}
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-primary w-full"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate('/login', { state: { register: true } })}
            className="w-full py-3 rounded-xl font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-body)',
              border: '1px solid var(--color-border)',
            }}
          >
            Register
          </button>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Continue as guest
        </button>
      </div>
    </div>
  )
}
