import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Brain,
  Droplet,
  Handshake,
  House,
  MessageCircle,
  Notebook,
  Settings as SettingsIcon,
  Shield,
  Trophy,
  Clapperboard,
  type LucideIcon,
} from 'lucide-react'
import { useT } from '../i18n'
import { useContactStore } from '../stores/contactStore'
import ContactModal from './ContactModal'
import PageSkeleton from './PageSkeleton'
import ThemeToggle from './ThemeToggle'

function Tab({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 min-h-[56px] flex flex-col items-center justify-center gap-0.5 px-0.5 pt-2 pb-1.5 ${
          isActive ? 'text-ink' : 'text-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* A real vector icon, not an emoji glyph. Emoji are drawn by
              whatever emoji font the OS ships -- Segoe UI Emoji on Windows,
              Noto Color Emoji on Android -- so the exact same character used
              to render as two visibly different pictures depending on the
              device. An SVG icon is the same pixels everywhere. */}
          <Icon
            size={22}
            strokeWidth={isActive ? 2.25 : 2}
            className={isActive ? '' : 'opacity-70'}
          />
          <span className="w-full truncate text-[0.6875rem] font-bold tracking-wide leading-tight text-center">{label}</span>
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
    { to: '/', label: t.nav.home, icon: House, end: true },
    { to: '/journal', label: t.nav.journal, icon: Notebook },
    { to: '/progress', label: t.nav.progress, icon: Trophy },
    { to: '/settings', label: t.nav.settings, icon: SettingsIcon },
  ]

  const bottom = [
    { to: '/lost', label: t.nav.lost, icon: Droplet },
    { to: '/trap', label: t.nav.trap, icon: Brain },
    { to: '/barriers', label: t.nav.barriers, icon: Shield },
    { to: '/watch', label: t.nav.watch, icon: Clapperboard },
    { to: '/help', label: t.nav.help, icon: Handshake },
    { to: '/community', label: t.nav.community, icon: MessageCircle },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <nav className="border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
        <div className="flex max-w-2xl mx-auto items-stretch">
          {top.map((tab) => (
            <Tab key={tab.to} {...tab} />
          ))}
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto pb-8">
        {/* One boundary for every lazy route. The nav and footer stay put while
            a page loads, so switching tabs does not blank the shell -- and the
            content area shows a skeleton instead of a bare dash, so a slow
            chunk load does not look like the page came back empty. */}
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="max-w-2xl w-full mx-auto px-4 pb-28 text-center text-[0.6875rem] text-muted">
        <NavLink to="/privacy" className="hover:text-ink">{t.settings.privacyLink}</NavLink>
        {' · '}
        <NavLink to="/terms" className="hover:text-ink">{t.settings.termsLink}</NavLink>
        {' · '}
        <a href="https://github.com/rosilvosa/reality-check" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
          {t.settings.sourceCode}
        </a>
        {' · '}
        <NavLink to="/updates" className="hover:text-ink">{t.settings.updatesLink}</NavLink>
        {' · '}
        <button type="button" onClick={() => showContact()} className="hover:text-ink">
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
