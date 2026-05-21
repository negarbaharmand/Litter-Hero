import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      <PointsCard totalPoints={user?.points ?? 0} weeklyPoints={user?.weeklyPoints ?? 0} />
      <BadgeList badges={[
        { id: 0, label: "🔥|3 day streak" }, // TODO: implement streak logic
        ...(user?.badges?.map((label: string, index: number) => ({
          id: index + 1,
          label
        })) ?? [])
      ]} />
      <SettingsButton onClick={() => console.log('Settings clicked')} />
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
