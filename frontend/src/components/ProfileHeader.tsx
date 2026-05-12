//Det här en komponent för att visa användarens profilheader, som inkluderar avatar, namn och level

interface ProfileHeaderProps {
  username: string | null
  level: number
  createdAt?: string
}

const getInitial = (username: string) => username.charAt(0).toUpperCase()

const getAvatarColor = (username: string) => {
  const colors = ['#ef4444', '#4ade80', '#3b82f6', '#eab308', '#a855f7', '#ec4899']
  const hash = username.charCodeAt(0)
  return colors[hash % colors.length]
}

const formatMemberSince = (dateStr?: string) => {
  if (!dateStr) return 'Member since unknown'
  const date = new Date(dateStr)
  return `Member since ${date.toLocaleString('en-US', { month: 'short', year: 'numeric' })}`
}

const ProfileHeader = ({ username, level, createdAt }: ProfileHeaderProps) => {
  const displayName = username ?? 'User'
  const initial = getInitial(displayName)
  const avatarColor = getAvatarColor(displayName)

  return (
    <div className="flex flex-col items-center pt-8 pb-4" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3"
        style={{ backgroundColor: avatarColor }}
      >
        {initial}
      </div>

      {/* Namn */}
      <span className="font-semibold text-lg" style={{ color: '#111827' }}>
        {displayName}
      </span>

      {/* Member since */}
      <span className="text-sm mt-1" style={{ color: '#6b7280' }}>
        {formatMemberSince(createdAt)}
      </span>

      {/* Level badge */}
      <span className="text-sm mt-2 border rounded-full px-3 py-0.5" style={{ color: '#4ade80', borderColor: '#4ade80' }}>
        Level {level}
      </span>
    </div>
  )
}

export default ProfileHeader