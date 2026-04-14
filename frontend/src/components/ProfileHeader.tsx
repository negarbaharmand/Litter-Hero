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

    </div>
  )
}

export default ProfileHeader