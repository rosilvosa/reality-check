export type Theme = 'dark' | 'light'

const KEY = 'rc_theme'
const DARK_COLOR = '#08080f'
const LIGHT_COLOR = '#f3f3f6'

export function readTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? DARK_COLOR : LIGHT_COLOR)
}

export function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch { /* ignore */ }
  applyTheme(theme)
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === 'dark' ? 'light' : 'dark'
  persistTheme(next)
  return next
}
