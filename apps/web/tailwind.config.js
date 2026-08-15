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
        amber: '#d97706',
        'amber-dim': '#78350f',
        muted: 'var(--rc-muted)',
      },
    },
  },
  plugins: [],
}
