import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useT } from '../i18n'

function word(label: string) {
  return label.replace(/^[^\p{L}\p{N}]+/u, '').trim()
}

export default function Layout() {
  const t = useT()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const primary = [
    { to: '/', label: t.nav.home, icon: '🏠', end: true },
    { to: '/journal', label: t.nav.journal, icon: '📓' },
    { to: '/progress', label: t.nav.progress, icon: '🏆' },
    { to: '/settings', label: t.nav.settings, icon: '⚙' },
  ]

  const moreItems = [
    { to: '/sweat', label: t.nav.sweat, icon: '💧', hint: t.sweat.subtitle },
    { to: '/assets', label: t.nav.assets, icon: '🔥', hint: t.settings.assetsHint },
    { to: '/nearmiss', label: t.nav.nearmiss, icon: '⚠️', hint: t.nearmiss.subtitle },
    { to: '/trap', label: t.nav.trap, icon: '🧠', hint: t.trap.subtitle },
    { to: '/barriers', label: t.settings.barriersTitle, icon: '🛡', hint: t.settings.barriersDesc },
  ]

  const moreActive = moreItems.some((item) => location.pathname === item.to)

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur px-5 pt-4 pb-3">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-1">Recovery tool</p>
        <h1 className="text-[22px] font-black text-white tracking-tight">Reality Check</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto pb-8">
        <Outlet />
      </main>

      <footer className="max-w-2xl w-full mx-auto px-4 pb-28 text-center text-[11px] text-muted">
        <NavLink to="/privacy" className="hover:text-white">{t.settings.privacyLink}</NavLink>
        {' · '}
        <NavLink to="/terms" className="hover:text-white">{t.settings.termsLink}</NavLink>
        {' · '}
        <a href="https://github.com/rosilvosa/reality-check" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          {t.settings.sourceCode}
        </a>
      </footer>

      {moreOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label={t.common.close}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-surface border-t border-border rounded-t-2xl px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-w-2xl mx-auto">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3 px-1">{t.nav.more}</p>
            <div className="space-y-1">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 min-h-[56px] px-3 rounded-xl transition-colors ${
                      isActive ? 'bg-surface2 text-white' : 'text-white hover:bg-surface2'
                    }`
                  }
                >
                  <span className="text-2xl w-9 text-center">{item.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-[15px]">{word(item.label)}</span>
                    <span className="block text-xs text-muted truncate">{item.hint}</span>
                  </span>
                  <span className="text-muted">→</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto flex">
          {primary.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                `flex-1 min-h-[60px] flex flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 text-[11px] font-bold tracking-wide ${
                  isActive ? 'text-white' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-[22px] leading-none ${isActive ? '' : 'opacity-70'}`}>{tab.icon}</span>
                  <span>{word(tab.label)}</span>
                  <span className={`mt-0.5 h-0.5 w-5 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={`flex-1 min-h-[60px] flex flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 text-[11px] font-bold tracking-wide ${
              moreActive || moreOpen ? 'text-white' : 'text-muted'
            }`}
          >
            <span className={`text-[22px] leading-none ${moreActive || moreOpen ? '' : 'opacity-70'}`}>☰</span>
            <span>{t.nav.more}</span>
            <span className={`mt-0.5 h-0.5 w-5 rounded-full ${moreActive || moreOpen ? 'bg-accent' : 'bg-transparent'}`} />
          </button>
        </div>
      </nav>
    </div>
  )
}
