//Det här en komponent för att visa en badge, som kan användas för att visa utmärkelser eller prestationer på användarprofilen
interface BadgeProps {
  label: string
}

const Badge = ({ label }: BadgeProps) => {
  return (
    <div style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} className="rounded-xl p-4 flex items-center justify-center text-center">
      <span className="text-sm" style={{ color: '#111827', fontFamily: "'Noto Sans', sans-serif" }}>{label}</span>
    </div>
  )
}

export default Badge