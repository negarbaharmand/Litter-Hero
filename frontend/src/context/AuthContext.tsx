import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, MeUser } from '../api'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: MeUser }
  | { status: 'unauthenticated' }

type AuthContextValue = {
  authState: AuthState
  setUser: (user: AuthUser, token: string) => void
  clearAuth: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setAuthState({ status: 'unauthenticated' })
      return
    }

    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json() as Promise<MeUser>
      })
      .then((user) => setAuthState({ status: 'authenticated', user }))
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setAuthState({ status: 'unauthenticated' })
      })
  }, [])

  function setUser(_user: AuthUser, token: string) {
    localStorage.setItem('token', token)
    // Fetch the full profile so weeklyPoints/badges are available immediately
    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json() as Promise<MeUser>)
      .then((meUser) => {
        localStorage.setItem('user', JSON.stringify(meUser))
        setAuthState({ status: 'authenticated', user: meUser })
      })
      .catch(() => {
        localStorage.removeItem('token')
        setAuthState({ status: 'unauthenticated' })
      })
  }

  function refreshUser() {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json() as Promise<MeUser>
      })
      .then((user) => {
        localStorage.setItem('user', JSON.stringify(user))
        setAuthState({ status: 'authenticated', user })
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setAuthState({ status: 'unauthenticated' })
      })
  }

  function clearAuth() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthState({ status: 'unauthenticated' })
  }

  return (
    <AuthContext.Provider value={{ authState, setUser, clearAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
