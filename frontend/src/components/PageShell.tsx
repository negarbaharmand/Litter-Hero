import { type ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode;
  /** Extra classes on the outer wrapper */
  className?: string;
  /** Remove the max-width inner wrapper (e.g. for full-bleed map pages) */
  fullWidth?: boolean;
}

/**
 * Standard page wrapper for every route except /login.
 * Handles padding for the fixed NavBar (bottom on mobile, top on desktop)
 * and sets the Figma page background colour.
 */
export function PageShell({ children, className = '', fullWidth = false }: PageShellProps) {
  return (
    <main id="main-content" tabIndex={-1} className={`page-shell ${className}`}>
      {fullWidth ? children : (
        <div className="page-shell__inner">
          {children}
        </div>
      )}
    </main>
  )
}
