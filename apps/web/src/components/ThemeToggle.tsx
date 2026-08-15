import { useState } from 'react'
import { useT } from '../i18n'
import { readTheme, toggleTheme } from '../lib/theme'

export default function ThemeToggle() {
  const t = useT()
  const [theme, setTheme] = useState(readTheme)

  function onToggle() {
    setTheme(toggleTheme())
  }

  const toLight = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="shrink-0 w-11 h-11 flex items-center justify-center text-muted hover:text-ink"
      aria-label={toLight ? t.common.themeLight : t.common.themeDark}
      title={toLight ? t.common.themeLight : t.common.themeDark}
    >
      <span className="text-[20px] leading-none" aria-hidden>
        {toLight ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
