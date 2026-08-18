/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--rc-bg)',
        surface: 'var(--rc-surface)',
        surface2: 'var(--rc-surface2)',
        border: 'var(--rc-border)',
        ink: 'var(--rc-ink)',
        accent: 'var(--rc-accent)',
        'accent-dim': 'var(--rc-accent-dim)',
        danger: 'var(--rc-danger)',
        amber: 'var(--rc-amber)',
        'amber-dim': 'var(--rc-amber-dim)',
        calm: 'var(--rc-calm)',
        'calm-dim': 'var(--rc-calm-dim)',
        // Deliberately not named "green" -- see the comment in index.css.
        support: 'var(--rc-support)',
        'support-dim': 'var(--rc-support-dim)',
        muted: 'var(--rc-muted)',
      },
    },
  },
  plugins: [],
}
