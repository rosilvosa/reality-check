import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useT } from '../i18n'
import { readTheme, toggleTheme } from '../lib/theme'

export default function ThemeToggle() {
  const t = useT()
  const [theme, setTheme] = useState(readTheme)

  function onToggle() {
    setTheme(toggleTheme())
  }

  const toLight = theme === 'dark'
  // Same reasoning as the nav icon swap: an emoji sun/moon renders from
  // whatever emoji font the OS ships, so it looked like a different icon set
  // from the rest of the chrome. Same Lucide icons, same fixed appearance.
  const Icon = toLight ? Sun : Moon

  return (
    <button
      type="button"
      onClick={onToggle}
      className="shrink-0 w-11 h-11 flex items-center justify-center text-muted hover:text-ink"
      aria-label={toLight ? t.common.themeLight : t.common.themeDark}
      title={toLight ? t.common.themeLight : t.common.themeDark}
    >
      <Icon size={20} strokeWidth={2} />
    </button>
  )
}
