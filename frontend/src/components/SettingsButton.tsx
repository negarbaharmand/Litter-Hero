//Det här en komponent för att visa en inställningsknapp.
interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-4 rounded-xl mx-4 mt-6"
      style={{
        width: 'calc(100% - 2rem)',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        color: '#111827',
        fontFamily: "'Noto Sans', sans-serif"
      }}
    >
      Account Settings
    </button>
  )
}

export default SettingsButton