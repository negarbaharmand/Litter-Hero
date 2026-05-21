import { Button } from './ui'

interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      className="mx-4 mt-4 text-left"
      style={{ width: 'calc(100% - 2rem)' }}
    >
      Account Settings
    </Button>
  )
}

export default SettingsButton