// Det här är en komponent för kontoinställningar med länkar till Privacy, About och Edit Profile
import { Link } from 'react-router-dom'

type SettingsButtonProps = {
  onEditProfileClick?: () => void
}

const SettingsButton = ({ onEditProfileClick }: SettingsButtonProps) => {
  return (
    <div className="mx-4 mt-6">
      <h3 className="mb-3!">Account Settings</h3>
      <div className="card flex flex-col">

        {/* Edit Profile placeholder */}
        <button
          type="button"
          onClick={onEditProfileClick}
          className="flex items-center justify-between py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>Edit Profile</span>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
        </button>

        {/* Privacy */}
        <Link
          to="/privacy"
          className="flex items-center justify-between py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>Privacy</span>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
        </Link>

        {/* About */}
        <Link
          to="/about"
          className="flex items-center justify-between py-3"
        >
          <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>About</span>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
        </Link>

      </div>
    </div>
  )
}

export default SettingsButton