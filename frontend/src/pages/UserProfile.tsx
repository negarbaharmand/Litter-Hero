import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader'
import ActivityHeatmap from '../components/ActivityHeatmap'
import PointsCard from '../components/PointsCard'
import BadgeList from '../components/BadgeList'
import SettingsButton from '../components/SettingsButton'
import { PageShell } from '../components/PageShell'
import { Button } from '../components/ui'
import { logoutUser } from '../api'
import { useAuth } from '../hooks/useAuth'

const UserProfile = () => {
  const navigate = useNavigate()
  const { authState, clearAuth, refreshUser } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const user = authState.status === 'authenticated' ? authState.user : null

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logoutUser()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  if (!user) return null

  return (
    <PageShell>
      <ProfileHeader username={user?.username} level={12} createdAt={user?.createdAt} />
      <PointsCard
        totalPoints={user?.points ?? 0}
        weeklyPoints={user?.weeklyPoints ?? 0}
        reportsCreated={user?.reportsCreated ?? 0}
        cleanupsApproved={user?.cleanupsApproved ?? 0}
        verificationVotes={user?.verificationVotes ?? 0}
      />
      <ActivityHeatmap
        activity={user.activity}
        currentStreak={user.currentStreak ?? 0}
      />
      <div className="mx-4 mt-6">
        <h3 className="mb-3!">Verification activity</h3>
        <div className="card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-page-bg)' }}>
              <span className="text-xl">🗳️</span>
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                {user?.verificationVotes ?? 0}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>votes cast</p>
            </div>
          </div>
          <Link
            to="/reports?tab=vote-queue"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors my-1 mx-1"
            style={{ backgroundColor: 'var(--color-green-normal)', color: '#ffffff' }}
          >
            Help verify
          </Link>
        </div>
      </div>

      <BadgeList badges={
        user?.badges?.map((label: string, index: number) => ({
          id: index,
          label,
        })) ?? []
      } />
      <div className="profile-actions mx-4 mt-6 mb-8 flex flex-col gap-3">
        <SettingsButton onClick={() => console.log('Settings clicked')} />
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate('/about')}
        >
          About us
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </Button>
      </div>
    </PageShell>
  )
}

export default UserProfile
