<<<<<<< HEAD
//Det här en komponent för att visa användarens profilheader
interface ProfileHeaderProps {
  username: string | null
  level: number
  createdAt?: string
}

const getInitial = (username: string) => username.charAt(0).toUpperCase()

const getAvatarColor = (username: string) => {
  const colors = [
    'var(--color-green-darker)',
    'var(--color-green-dark)',
    '#3b82f6',
    '#eab308',
    '#a855f7',
    '#ec4899'
  ]
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
    <div className="flex flex-col items-center pt-8 pb-4">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3"
        style={{ backgroundColor: avatarColor }}
      >
        {initial}
      </div>

      {/* Namn */}
      <span className="font-semibold text-body-xl" style={{ color: 'var(--color-text-primary)' }}>
        {displayName}
      </span>

      {/* Member since */}
      <span className="text-body-sm mt-1" style={{ color: 'var(--color-green-dark)' }}>
        {formatMemberSince(createdAt)}
      </span>

      {/* Level badge */}
      <span
        className="text-body-sm mt-2 border rounded-full px-3 py-0.5"
        style={{ color: 'var(--color-green-dark)', borderColor: 'var(--color-green-dark)' }}
      >
        Level {level}
      </span>
=======
//Det här en komponent för att visa användarens profilheader, som inkluderar avatar, namn och level

interface ProfileHeaderProps {
  username: string
  level: number
  avatarUrl?: string
}

const ProfileHeader = ({ username, level, avatarUrl }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center gap-4 p-4">

      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        )}
      </div>

      {/* Namn och level */}
      <div className="flex flex-col gap-1">
        <span className="text-white font-semibold text-lg">{username}</span>
        <span className="text-primary text-sm border border-primary rounded-full px-3 py-0.5 w-fit">
          Level {level}
        </span>
      </div>

>>>>>>> origin/main
    </div>
  )
}

export default ProfileHeader