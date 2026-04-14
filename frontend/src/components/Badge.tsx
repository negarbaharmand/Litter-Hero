//Det här en komponent för att visa en badge, som kan användas för att visa utmärkelser eller prestationer på användarprofilen
interface BadgeProps {
  label: string
}

const Badge = ({ label }: BadgeProps) => {
  return (
    <div className="bg-surface rounded-xl p-4 flex items-center justify-center text-center">
      <span className="text-white text-sm">{label}</span>
    </div>
  )
}

export default Badge