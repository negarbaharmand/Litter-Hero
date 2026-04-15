//Det här en komponent för att visa en inställningsknapp.
interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-surface text-white text-left px-4 py-4 rounded-xl mx-4 mt-6"
      style={{ width: 'calc(100% - 2rem)' }}
    >
      Account Settings
    </button>
  )
}

export default SettingsButton