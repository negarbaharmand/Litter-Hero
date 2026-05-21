<<<<<<< HEAD
import { Button } from './ui'

=======
//Det här en komponent för att visa en inställningsknapp.
>>>>>>> origin/main
interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
<<<<<<< HEAD
    <Button
      variant="secondary"
      onClick={onClick}
      className="mx-4 mt-4 text-left"
      style={{ width: 'calc(100% - 2rem)' }}
    >
      Account Settings
    </Button>
=======
    <button
      onClick={onClick}
      className="w-full bg-surface text-white text-left px-4 py-4 rounded-xl mx-4 mt-6"
      style={{ width: 'calc(100% - 2rem)' }}
    >
      Account Settings
    </button>
>>>>>>> origin/main
  )
}

export default SettingsButton