import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { ONBOARDED_EVENT, isInAppBrowser, isOnboarded, isStandalone } from '../lib/pwa'

const HIDE_KEY = 'rc_pwa_hide'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export default function InstallHint() {
  const t = useT()
  const deferred = useRef<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<'hidden' | 'install' | 'ios'>('hidden')

  useEffect(() => {
    if (localStorage.getItem(HIDE_KEY) || isStandalone() || isInAppBrowser()) return

    function reveal() {
      if (!isOnboarded() || localStorage.getItem(HIDE_KEY) || isStandalone() || isInAppBrowser()) return
      if (deferred.current) setMode('install')
      else if (isIos()) setMode('ios')
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      deferred.current = e as BeforeInstallPromptEvent
      reveal()
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener(ONBOARDED_EVENT, reveal)
    const timer = window.setTimeout(reveal, 600)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener(ONBOARDED_EVENT, reveal)
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
      <p className="text-ink font-bold text-sm mb-1">{t.home.installTitle}</p>
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
          className="px-3 py-2 border border-border text-muted rounded-lg text-xs hover:text-ink"
        >
          {t.home.installDismiss}
        </button>
      </div>
    </div>
  )
}
