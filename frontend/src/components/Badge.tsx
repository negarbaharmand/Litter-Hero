//Det här en komponent för att visa en badge, som kan användas för att visa utmärkelser eller prestationer på användarprofilen
interface BadgeProps {
  label: string
}

const Badge = ({ label }: BadgeProps) => {
<<<<<<< HEAD
  const [icon, text] = label.includes('|') ? label.split('|') : ['🏅', label]

  return (
    <div className="card flex flex-col items-center justify-center text-center gap-2 p-3" style={{ minHeight: '80px' }}>
      <span className="text-2xl">{icon}</span>
      <span className="text-body-sm font-medium text-text-primary">{text}</span>
=======
  return (
    <div className="bg-surface rounded-xl p-4 flex items-center justify-center text-center">
      <span className="text-white text-sm">{label}</span>
>>>>>>> origin/main
    </div>
  )
}

export default Badge