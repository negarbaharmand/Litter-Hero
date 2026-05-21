import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

/**
 * Shared button component — maps to Figma "Buttons" design system.
 * Use variant="primary" for filled green CTA, variant="secondary" for outlined.
 */
export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary'
  const width = fullWidth ? 'w-full' : ''
  return (
    <button className={`${base} ${width} ${className}`} {...props}>
      {children}
    </button>
  )
}
