import { Button } from './ui'

interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <Button
      variant="secondary"
      fullWidth
      onClick={onClick}
      className="text-left"
    >
      Account Settings
    </Button>
  )
}

export default SettingsButton