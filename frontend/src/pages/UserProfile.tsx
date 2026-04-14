//User profile page for displaying user profile
//Here we are only building the skeleton of the user profile page, we will add more features later
import ProfileHeader from '../components/ProfileHeader'
import PointsCard from '../components/PointsCard'
import BadgeList from '../components/BadgeList'
import SettingsButton from '../components/SettingsButton'

const UserProfile = () => {
  return (
    <div className="bg-background min-h-screen">
      <ProfileHeader username="Användare123" level={12} />
      <PointsCard totalPoints={500} weeklyPoints={180} />
      <BadgeList badges={["🔥3 dagars streak", "Annan utmärkelse", "Annan utmärkelse"]} />
      <SettingsButton onClick={() => console.log('Inställningar klickad')} />
    </div>
  )
}

export default UserProfile

