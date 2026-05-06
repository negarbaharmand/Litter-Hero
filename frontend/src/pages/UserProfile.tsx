//User profile page for displaying user profile
//Here we are only building the skeleton of the user profile page, we will add more features later
import { useNavigate } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader'
import PointsCard from '../components/PointsCard'
import BadgeList from '../components/BadgeList'
import SettingsButton from '../components/SettingsButton'

const UserProfile = () => {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
<div className="bg-background min-h-screen pb-24">
  <ProfileHeader username={null} level={12} />
      <PointsCard totalPoints={500} weeklyPoints={180} />
      <BadgeList badges={[ //Example badges(hardcoded), we will replace this with real data later
        { id: 1, label: "🔥3 day streak" },
        { id: 2, label: "Another award" },
        { id: 3, label: "Another award" }
      ]} />
      <SettingsButton onClick={() => console.log('Settings clicked')} />

      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-4 rounded-xl mt-3 text-red-500 font-medium"
        style={{ width: 'calc(100% - 2rem)', marginLeft: '1rem', backgroundColor: 'rgba(239,68,68,0.1)' }}
      >
        Log out
      </button>
    </div>
  )
}

export default UserProfile

