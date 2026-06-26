import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', label: '💧 Sweat', end: true },
  { to: '/assets', label: '🔥 Assets' },
  { to: '/journal', label: '📓 Journal' },
  { to: '/nearmiss', label: '⚠️ Near-Miss' },
  { to: '/progress', label: '🏆 Progress' },
  { to: '/settings', label: '⚙ Settings' },
]

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="border-b border-border bg-surface px-4 pt-4 pb-0">
        <p className="text-[11px] tracking-widest uppercase text-muted mb-1">Gambling Recovery Tool</p>
        <h1 className="text-xl font-extrabold text-white mb-3">Reality Check</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-surface border-t border-border flex">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-[11px] font-bold leading-tight transition-colors ${
                isActive ? 'text-accent border-t-2 border-accent' : 'text-muted'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
