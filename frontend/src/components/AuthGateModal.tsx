import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type AuthGateModalProps = {
  open: boolean
  message: string
  onDismiss: () => void
}

export function AuthGateModal({ open, message, onDismiss }: AuthGateModalProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onDismiss])

  if (!open) return null

  return (
    <div
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
        <h2 id="auth-gate-title" className="text-lg font-semibold text-center" style={{ color: 'var(--color-text-primary)' }}>
          {message}
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate('/login', { state: { register: true } })}
            className="w-full py-3 rounded-xl font-medium transition-colors"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-body)',
            }}
          >
            Register
          </button>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Continue as guest
        </button>
      </div>
    </div>
  )
}
