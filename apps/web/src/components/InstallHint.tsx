import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'

const HIDE_KEY = 'rc_pwa_hide'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export default function InstallHint() {
  const t = useT()
  const deferred = useRef<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<'hidden' | 'install' | 'ios'>('hidden')

  useEffect(() => {
    if (localStorage.getItem(HIDE_KEY) || isStandalone()) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      deferred.current = e as BeforeInstallPromptEvent
      setMode('install')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    const timer = window.setTimeout(() => {
      if (!deferred.current && isIos()) setMode('ios')
    }, 600)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.clearTimeout(timer)
    }
  }, [])

  function hide() {
    localStorage.setItem(HIDE_KEY, '1')
    setMode('hidden')
  }

  async function install() {
    const ev = deferred.current
    if (!ev) return
    await ev.prompt()
    hide()
  }

  if (mode === 'hidden') return null

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
      <p className="text-white font-bold text-sm mb-1">{t.home.installTitle}</p>
      {mode === 'ios' ? (
        <p className="text-xs text-muted leading-relaxed mb-3">{t.home.installIos}</p>
      ) : (
        <p className="text-xs text-muted leading-relaxed mb-3">{t.home.installBody}</p>
      )}
      <div className="flex gap-2">
        {mode === 'install' && (
          <button
            type="button"
            onClick={install}
            className="flex-1 py-2 bg-accent text-white font-bold rounded-lg text-xs"
          >
            {t.home.installBtn}
          </button>
        )}
        <button
          type="button"
          onClick={hide}
          className="px-3 py-2 border border-border text-muted rounded-lg text-xs hover:text-white"
        >
          {t.home.installDismiss}
        </button>
      </div>
    </div>
  )
}
