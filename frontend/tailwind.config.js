/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Green palette (from Figma design system) ──────────────────
        green: {
          'bg-opacity':  'rgba(44,168,88,0.2)',
          light:         '#eefcf3',
          'light-hover': '#e5faed',
          'light-active':'#caf5d9',
          normal:        '#53e086',
          'normal-hover':'#4bca79',
          'normal-active':'#42b36b',
          dark:          '#3ea865',
          'dark-hover':  '#328650',
          'dark-active': '#25653c',
          darker:        '#1d4e2f',
          neon:          '#14f000',
        },
        // ── Grey palette ──────────────────────────────────────────────
        grey: {
          lighter:       '#d2d2d2',
          'light-hover': '#c9c9c9',
          'light-active':'#bebebe',
          normal:        '#9b9b9b',
          'normal-hover':'#848484',
          'normal-active':'#717171',
          dark:          '#363636',
          'dark-hover':  '#272727',
          'dark-active': '#111111',
          darkest:       '#191919',
          'bg-light':    '#1f1f1f',
          'bg-dark':     '#111111',
          'topbar-dark': '#131313',
        },
        // ── Semantic shortcuts ─────────────────────────────────────────
        'page-bg':       '#eefcf3',
        'page-bg-dark':  '#191919',
        'surface':       '#ffffff',
        'surface-dark':  '#1f1f1f',
        'text-primary':  '#1d4e2f',
        'text-dark':     '#111111',
        'text-muted':    '#717171',
        'border-default':'#d2d2d2',
        'danger':        '#ef4444',
      },
      borderRadius: {
        card: '20px',
        btn:  '12px',
      },
      boxShadow: {
        card: '0px 4px 4px 0px rgba(0,0,0,0.15)',
      },
      fontSize: {
        // Noto Sans Bold — Headers (scale 1.309, base 16)
        'h1': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['27px', { lineHeight: '1.2', fontWeight: '700' }],
        'h3': ['21px', { lineHeight: '1.3', fontWeight: '700' }],
        // Noto Sans — Body (scale 1.25, base 16)
        'body-xl': ['20px', { lineHeight: '1.5' }],
        'body-lg': ['16px', { lineHeight: '1.5' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        'body-xs': ['10px', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
}
