import { createContext } from 'react'
import type { AuthUser, MeUser } from '../api'

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: MeUser }
  | { status: 'unauthenticated' }

export type AuthContextValue = {
  authState: AuthState
  setUser: (user: AuthUser, token: string) => void
  clearAuth: () => void
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
