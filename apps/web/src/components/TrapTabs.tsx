import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'

export default function TrapTabs() {
  const t = useT()
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex-1 py-2.5 rounded-lg text-sm font-bold text-center ${
      isActive ? 'bg-accent text-white' : 'text-muted hover:text-ink'
    }`

  return (
    <div className="flex gap-1 bg-surface2 border border-border rounded-xl p-1 mb-5">
      <NavLink to="/trap" end className={cls}>
        {t.trap.calcTab}
      </NavLink>
      <NavLink to="/trap/why" className={cls}>
        {t.trap.whyLink}
      </NavLink>
    </div>
  )
}
