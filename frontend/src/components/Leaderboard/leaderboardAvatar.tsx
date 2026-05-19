import { useState } from 'react';

const getInitial = (username: string) => username.charAt(0).toUpperCase();

const getAvatarColor = (username: string) => {
  const colors = ['#ef4444', '#4ade80', '#3b82f6', '#eab308', '#a855f7', '#ec4899'];
  const hash = username.charCodeAt(0);
  return colors[hash % colors.length];
}

function DefaultAvatar({ username }: { username: string }) {
  const initial = getInitial(username);
  const avatarColor = getAvatarColor(username);

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
      style={{ backgroundColor: avatarColor }}
    >
      {initial}
    </div>
  )
}

export default function ProfilePicture({ username, profilePictureUrl }: { username: string; profilePictureUrl: string | null }) {
  const [imageError, setImageError] = useState(false);

  if (!profilePictureUrl || imageError) {
    return <DefaultAvatar username={username} />
  }

  return (
    <img
      src={profilePictureUrl}
      alt={`${username}'s profile picture`}
      className="w-10 h-10 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  )
}