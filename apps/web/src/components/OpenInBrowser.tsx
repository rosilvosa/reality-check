import { useState } from 'react'
import { useT } from '../i18n'
import { isInAppBrowser, isStandalone, openInSystemBrowser } from '../lib/pwa'

export default function OpenInBrowser() {
  const t = useT()
  const [hidden, setHidden] = useState(false)

  if (hidden || isStandalone() || !isInAppBrowser()) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[60] px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="max-w-2xl mx-auto bg-surface border border-accent rounded-xl p-4 shadow-2xl">
        <p className="text-ink font-bold text-sm mb-1">{t.home.openBrowserTitle}</p>
        <p className="text-xs text-muted leading-relaxed mb-3">{t.home.openBrowserBody}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openInSystemBrowser}
            className="flex-1 py-2.5 bg-accent text-white font-bold rounded-lg text-xs"
          >
            {t.home.openBrowserBtn}
          </button>
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="px-3 py-2.5 border border-border text-muted rounded-lg text-xs hover:text-ink"
          >
            {t.common.close}
          </button>
        </div>
        <p className="text-[11px] text-muted mt-2 leading-relaxed">{t.home.openBrowserHow}</p>
      </div>
    </div>
  )
}
