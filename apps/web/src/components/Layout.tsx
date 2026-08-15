import { NavLink, Outlet } from 'react-router-dom'
import { useT } from '../i18n'
import { useContactStore } from '../stores/contactStore'
import ContactModal from './ContactModal'

function word(label: string) {
  return label.replace(/^[^\p{L}\p{N}]+/u, '').trim()
}

function Tab({
  to,
  label,
  icon,
  end,
}: {
  to: string
  label: string
  icon: string
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 min-h-[56px] flex flex-col items-center justify-center gap-0.5 px-0.5 pt-2 pb-1.5 ${
          isActive ? 'text-white' : 'text-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`text-[22px] leading-none ${isActive ? '' : 'opacity-70'}`}>{icon}</span>
          <span className="text-[11px] font-bold tracking-wide leading-tight text-center">{word(label)}</span>
          <span className={`h-0.5 w-5 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
        </>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const t = useT()
  const showContact = useContactStore((s) => s.show)

  const top = [
    { to: '/', label: t.nav.home, icon: '🏠', end: true },
    { to: '/journal', label: t.nav.journal, icon: '📓' },
    { to: '/progress', label: t.nav.progress, icon: '🏆' },
    { to: '/settings', label: t.nav.settings, icon: '⚙' },
  ]

  const bottom = [
    { to: '/sweat', label: t.nav.sweat, icon: '💧' },
    { to: '/assets', label: t.nav.assets, icon: '🔥' },
    { to: '/nearmiss', label: t.nav.nearmiss, icon: '⚠️' },
    { to: '/trap', label: t.nav.trap, icon: '🧠' },
    { to: '/barriers', label: t.settings.barriersTitle, icon: '🛡' },
    { to: '/help', label: t.nav.help, icon: '🤝' },
    { to: '/community', label: t.nav.community, icon: '💬' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <nav className="border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
        <div className="flex max-w-2xl mx-auto">
          {top.map((tab) => (
            <Tab key={tab.to} {...tab} />
          ))}
        </div>
      </nav>

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
        {' · '}
        <NavLink to="/mission" className="hover:text-white">{t.settings.missionLink}</NavLink>
        {' · '}
        <button type="button" onClick={showContact} className="hover:text-white">
          {t.settings.contactLink}
        </button>
      </footer>

      <ContactModal />

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto flex">
          {bottom.map((tab) => (
            <Tab key={tab.to} {...tab} />
          ))}
        </div>
      </nav>
    </div>
  )
}
