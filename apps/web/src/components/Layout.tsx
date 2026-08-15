import { NavLink, Outlet } from 'react-router-dom'
import { useT } from '../i18n'

export default function Layout() {
  const t = useT()

  const tabs = [
    { to: '/', label: t.nav.sweat, end: true },
    { to: '/assets', label: t.nav.assets },
    { to: '/journal', label: t.nav.journal },
    { to: '/nearmiss', label: t.nav.nearmiss },
    { to: '/trap', label: t.nav.trap },
    { to: '/progress', label: t.nav.progress },
    { to: '/settings', label: t.nav.settings },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="border-b border-border bg-surface px-4 pt-4 pb-0">
        <p className="text-[11px] tracking-widest uppercase text-muted mb-1">Gambling Recovery Tool</p>
        <h1 className="text-xl font-extrabold text-white mb-3">Reality Check</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto pb-24">
        <Outlet />
      </main>

      <footer className="max-w-2xl w-full mx-auto px-4 pb-20 text-center text-[11px] text-muted">
        <NavLink to="/privacy" className="hover:text-white">{t.settings.privacyLink}</NavLink>
        {' · '}
        <NavLink to="/terms" className="hover:text-white">{t.settings.termsLink}</NavLink>
        {' · '}
        <a href="https://github.com/rosilvosa/reality-check" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          {t.settings.sourceCode}
        </a>
      </footer>

      <nav className="fixed bottom-0 inset-x-0 bg-surface border-t border-border flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-[11px] font-bold leading-tight transition-colors ${
                isActive ? 'text-accent border-t-2 border-accent' : 'text-muted'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
