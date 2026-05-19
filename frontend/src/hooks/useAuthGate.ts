import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

type GateState = { open: boolean; message: string }

/**
 * Returns a `requireAuth(message, action)` callable that runs `action` if the
 * user is authenticated, or opens an AuthGateModal with `message` otherwise.
 *
 * Render `<AuthGateModal open={gate.open} message={gate.message} onDismiss={dismiss} />`
 * in the consuming component.
 */
export function useAuthGate() {
  const { authState } = useAuth()
  const [gate, setGate] = useState<GateState>({ open: false, message: '' })

  const requireAuth = useCallback(
    (message: string, action: () => void) => {
      if (authState.status === 'authenticated') {
        action()
        return
      }
      setGate({ open: true, message })
    },
    [authState.status]
  )

  const dismiss = useCallback(() => setGate((g) => ({ ...g, open: false })), [])

  return { gate, dismiss, requireAuth }
}
