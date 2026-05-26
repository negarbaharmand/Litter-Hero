import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader'
import ActivityHeatmap from '../components/ActivityHeatmap'
import PointsCard from '../components/PointsCard'
import MilestoneCard from '../components/MilestoneCard'
import BadgeList from '../components/BadgeList'
import SettingsButton from '../components/SettingsButton'
import { PageShell } from '../components/PageShell'
import { Button } from '../components/ui'
import { logoutUser } from '../api'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'

const UserProfile = () => {
  const navigate = useNavigate()
  const { authState, clearAuth, refreshUser } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const user = authState.status === 'authenticated' ? authState.user : null

  // Hämtar leaderboard och letar upp inloggad användares rank via id
  const { data: leaderboardData } = useLeaderboard('allTime')
  const rank = leaderboardData?.entries.find((e) => e.id === user?.id)?.rank ?? null

  // Uppdaterar användarprofilen när sidan laddas
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

  // Samlar ihop user-data i ett objekt för tydligare JSX
  const display = {
    points: user?.points ?? 0,
    weeklyPoints: user?.weeklyPoints ?? 0,
    reportsCreated: user?.reportsCreated ?? 0,
    cleanupsApproved: user?.cleanupsApproved ?? 0,
    verificationVotes: user?.verificationVotes ?? 0,
    badges: user?.badges ?? [],
  }

  return (
    <PageShell>
      <div className="pb-32">
        <ProfileHeader username={user?.username} createdAt={user?.createdAt} />
        {/* rank skickas till PointsCard för att visas i kortet */}
        <PointsCard
          totalPoints={display.points}
          weeklyPoints={display.weeklyPoints}
          reportsCreated={display.reportsCreated}
          cleanupsApproved={display.cleanupsApproved}
          verificationVotes={display.verificationVotes}
          rank={rank}
        />
        {/* ActivityHeatmap visar streak och daglig aktivitet */}
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
                  {display.verificationVotes}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>votes cast</p>
              </div>
            </div>
            <Link
              to="/reports?tab=vote-queue"
              className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--color-green-normal)', color: '#ffffff' }}
            >
              Help verify
            </Link>
          </div>
        </div>

        {/* Badges från backend*/}
        <BadgeList badges={
          display.badges.map((label: string, index: number) => ({
            id: index,
            label,
          }))
        } />
        <MilestoneCard currentPoints={display.points} />

        {/* About, privacy and edit profile in settings */}
        <SettingsButton />
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
      </div>
    </PageShell>
  )
}

export default UserProfile