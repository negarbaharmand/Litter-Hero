//Det här en komponent för att visa en inställningsknapp
interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="btn-secondary mx-4 mt-4 text-left"
      style={{ width: 'calc(100% - 2rem)' }}
    >
      Account Settings
    </button>
  )
}

export default SettingsButton