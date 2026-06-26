/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080f',
        surface: '#111118',
        surface2: '#18181f',
        border: '#232330',
        accent: '#dc2626',
        'accent-dim': '#7f1d1d',
        amber: '#d97706',
        'amber-dim': '#78350f',
        muted: '#6b6b80',
      },
    },
  },
  plugins: [],
}
