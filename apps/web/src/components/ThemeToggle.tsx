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
      className="shrink-0 min-h-[56px] flex flex-col items-center justify-center gap-0.5 px-2 pt-2 pb-1.5 text-muted hover:text-ink"
      aria-label={toLight ? t.common.themeLight : t.common.themeDark}
      title={toLight ? t.common.themeLight : t.common.themeDark}
    >
      <Icon size={22} strokeWidth={2} />
      <span className="w-full truncate text-[0.6875rem] font-bold tracking-wide leading-tight text-center">{t.common.theme}</span>
      <span className="h-0.5 w-5 rounded-full bg-transparent" />
    </button>
  )
}
