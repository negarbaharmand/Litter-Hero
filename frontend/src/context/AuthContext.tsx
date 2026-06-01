import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, MeUser } from '../api'
import { emptyActivityHeatmap } from '../api'
import { AuthContext, type AuthState } from './authContext'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

const SEEN_BADGES_KEY = 'seenBadges'

function getSeenBadges(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveSeenBadges(badges: string[]) {
  localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(badges))
}

function detectNewBadges(currentBadges: string[]): string[] {
  const seen = getSeenBadges()
  return currentBadges.filter(b => !seen.includes(b))
}

function normalizeMeUser(user: MeUser): MeUser {
  const activity =
    user.activity &&
    typeof user.activity.weeks === 'number' &&
    Array.isArray(user.activity.grid)
      ? user.activity
      : emptyActivityHeatmap()

  return {
    ...user,
    currentStreak: typeof user.currentStreak === 'number' ? user.currentStreak : 0,
    longestStreak: typeof user.longestStreak === 'number' ? user.longestStreak : 0,
    weeklyPoints: typeof user.weeklyPoints === 'number' ? user.weeklyPoints : 0,
    badges: Array.isArray(user.badges) ? user.badges : [],
    activity,
    profileImageUrl: user.profileImageUrl ?? null,
    hasPassword: typeof user.hasPassword === 'boolean' ? user.hasPassword : true,
  }
}

function getInitialAuthState(): AuthState {
  const token = localStorage.getItem('token')
  if (!token) return { status: 'unauthenticated' }
  return { status: 'loading' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState)
  const [newBadges, setNewBadges] = useState<string[]>([])

  const clearNewBadges = useCallback(() => setNewBadges([]), [])

  function applyUser(user: MeUser, skipNewBadgeDetection = false) {
    const normalized = normalizeMeUser(user)
    if (!skipNewBadgeDetection) {
      const fresh = detectNewBadges(normalized.badges)
      if (fresh.length > 0) {
        setNewBadges(prev => {
          const combined = [...prev, ...fresh.filter(b => !prev.includes(b))]
          return combined
        })
      }
    }
    saveSeenBadges(normalized.badges)
    return normalized
  }

  useEffect(() => {
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
        // On app load, don't fire celebrations for already-owned badges
        const normalized = normalizeMeUser(user)
        saveSeenBadges(normalized.badges)
        setAuthState({ status: 'authenticated', user: normalized })
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setAuthState({ status: 'unauthenticated' })
      })
  }, [])

  function setUser(_user: AuthUser, token: string) {
    localStorage.setItem('token', token)
    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json() as Promise<MeUser>)
      .then((meUser) => {
        // On login, mark all current badges as seen (no celebration for pre-existing badges)
        const normalized = normalizeMeUser(meUser)
        saveSeenBadges(normalized.badges)
        localStorage.setItem('user', JSON.stringify(normalized))
        setAuthState({ status: 'authenticated', user: normalized })
      })
      .catch(() => {
        localStorage.removeItem('token')
        setAuthState({ status: 'unauthenticated' })
      })
  }

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Unauthorized')
      const user = await res.json() as MeUser
      const normalized = applyUser(user)
      localStorage.setItem('user', JSON.stringify(normalized))
      setAuthState({ status: 'authenticated', user: normalized })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setAuthState({ status: 'unauthenticated' })
    }
  }, [])

  function clearAuth() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthState({ status: 'unauthenticated' })
  }

  return (
    <AuthContext.Provider value={{ authState, setUser, clearAuth, refreshUser, newBadges, clearNewBadges }}>
      {children}
    </AuthContext.Provider>
  )
}
