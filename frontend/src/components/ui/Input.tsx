import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/**
 * Shared text input — maps to Figma "Textboxes" spec:
 * white bg, radius 12px, border #d2d2d2, focus ring green, error ring red.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-(--color-text-body)">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input--error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="field-error">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
