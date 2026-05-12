import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ProfileHeader from '../components/ProfileHeader'
import PointsCard from '../components/PointsCard'
import BadgeList from '../components/BadgeList'
import SettingsButton from '../components/SettingsButton'
import { logoutUser } from '../api'

const API_BASE_URL = import.meta.env.VITE_API_URL

const UserProfile = () => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const token = localStorage.getItem('token') // Get token
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}` // Send with token in auth header
        }
      })
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    }
  })

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logoutUser()
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  if (isLoading) return <div className="bg-background min-h-screen p-4 text-white">loading...</div>
  if (isError) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#EEFCF3' }}>
      <ProfileHeader username={user?.username} level={12} createdAt={user?.createdAt} />
      <PointsCard totalPoints={user?.points ?? 0} weeklyPoints={user?.weeklyPoints ?? 0} />
      <BadgeList badges={[
        { id: 0, label: "🔥3 day streak"}, //TODO: implement streak logic
        ...(user?.badges?.map((label: string, index: number) => ({
          id: index + 1, 
          label
        })) ?? [])
      ]} />
      
      <SettingsButton onClick={() => console.log('Settings clicked')} />

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full text-left px-4 py-4 rounded-xl mt-3 text-red-500 font-medium disabled:opacity-50"
        style={{ width: 'calc(100% - 2rem)', marginLeft: '1rem', backgroundColor: 'rgba(239,68,68,0.1)' }}
      >
        {isLoggingOut ? 'Logging out...' : 'Log out'}
      </button>
    </div>
  )
}

export default UserProfile
