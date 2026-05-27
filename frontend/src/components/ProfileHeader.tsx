import { useState } from "react";

interface ProfileHeaderProps {
  username: string | null;
  createdAt?: string;
  profileImageUrl?: string | null;
}

const getInitial = (username: string) => username.charAt(0).toUpperCase();

const getAvatarColor = (username: string) => {
  const colors = [
    "#1d4e2f",
    "#3ea865",
    "#3b82f6",
    "#eab308",
    "#a855f7",
    "#ec4899",
  ];
  const hash = username.charCodeAt(0);
  return colors[hash % colors.length];
};

const formatMemberSince = (dateStr?: string) => {
  if (!dateStr) return "Member since unknown";
  const date = new Date(dateStr);
  return `Member since ${date.toLocaleString("en-US", { month: "short", year: "numeric" })}`;
};

const ProfileHeader = ({ username, createdAt, profileImageUrl }: ProfileHeaderProps) => {
  const displayName = username ?? "User";
  const initial = getInitial(displayName);
  const avatarColor = getAvatarColor(displayName);
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(profileImageUrl && !imgError);

  return (
    <div className="flex flex-col items-center pt-8 pb-4">
      {/* Avatar */}
      {showImage ? (
        <img
          src={profileImageUrl ?? undefined}
          alt={displayName}
          className="w-20 h-20 rounded-full object-cover mb-3"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3"
          style={{ backgroundColor: avatarColor }}
        >
          {initial}
        </div>
      )}

      {/* Namn */}
      <span
        className="font-semibold text-body-xl"
        style={{ color: "var(--color-text-primary)" }}
      >
        {displayName}
      </span>

      {/* Member since */}
      <span
        className="text-body-sm mt-1"
        style={{ color: "var(--color-text-body)" }}
      >
        {formatMemberSince(createdAt)}
      </span>
    </div>
  );
};

export default ProfileHeader;
