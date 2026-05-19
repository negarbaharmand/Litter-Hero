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
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="auth-gate-title" className="text-lg font-semibold text-gray-900 text-center">
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
            className="w-full py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Register
          </button>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Continue as guest
        </button>
      </div>
    </div>
  )
}
