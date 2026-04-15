//User profile page for displaying user profile
//Here we are only building the skeleton of the user profile page, we will add more features later
import ProfileHeader from '../components/ProfileHeader'
import PointsCard from '../components/PointsCard'
import BadgeList from '../components/BadgeList'
import SettingsButton from '../components/SettingsButton'

const UserProfile = () => {
  return (
    <div className="bg-background min-h-screen">
      <ProfileHeader username="User123" level={12} />
      <PointsCard totalPoints={500} weeklyPoints={180} />
      <BadgeList badges={["🔥3 day streak", "Another award", "Another award"]} />
      <SettingsButton onClick={() => console.log('Settings clicked')} />
    </div>
  )
}

export default UserProfile

