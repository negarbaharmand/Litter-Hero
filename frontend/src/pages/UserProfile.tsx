import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader'
import PointsCard from '../components/PointsCard'
import BadgeList from '../components/BadgeList'
import SettingsButton from '../components/SettingsButton'
import { PageShell } from '../components/PageShell'
import { Button } from '../components/ui'
import { logoutUser } from '../api'
import { useAuth } from '../hooks/useAuth'

const UserProfile = () => {
  const navigate = useNavigate()
  const { authState, clearAuth } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const user = authState.status === 'authenticated' ? authState.user : null

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
            to="/reports?filter=cleanup_pending_vote"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--color-green-normal)', color: '#ffffff' }}
          >
            Needs votes
          </Link>
        </div>
      </div>

      <BadgeList badges={[
        { id: 0, label: "🔥|3 day streak" }, // TODO: implement streak logic
        ...(user?.badges?.map((label: string, index: number) => ({
          id: index + 1,
          label
        })) ?? [])
      ]} />
      <SettingsButton onClick={() => console.log('Settings clicked')} />
      <Button
        variant="secondary"
        className="mx-4 mt-3 text-left"
        style={{ width: 'calc(100% - 2rem)' }}
        onClick={() => navigate('/about')}
      >
        About us
      </Button>
      <Button
        variant="primary"
        fullWidth
        disabled={isLoggingOut}
        onClick={handleLogout}
        className="mx-4 mt-3"
        style={{ width: 'calc(100% - 2rem)' }}
      >
        {isLoggingOut ? 'Logging out...' : 'Log out'}
      </Button>
    </PageShell>
  )
}

export default UserProfile
