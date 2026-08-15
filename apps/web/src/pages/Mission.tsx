import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'

const BEACON = 'https://davidsbeacon.com'
const ABOUT = 'https://davidsbeacon.com/about'

export default function Mission() {
  const t = useT()

  return (
    <div>
      <NavLink to="/settings" className="text-xs text-muted hover:text-white mb-4 inline-block">
        ← {t.common.back}
      </NavLink>
      <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-1">{t.mission.tag}</p>
      <h2 className="text-lg font-extrabold text-white mb-3">{t.mission.title}</h2>
      <p className="text-sm text-muted leading-relaxed mb-4">{t.mission.body1}</p>
      <p className="text-sm text-muted leading-relaxed mb-6">{t.mission.body2}</p>

      <div className="space-y-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-white font-bold text-[15px] mb-1">{t.mission.belief1Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.belief1Body}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-white font-bold text-[15px] mb-1">{t.mission.belief2Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.belief2Body}</p>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.mission.howTitle}</p>
      <div className="space-y-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-white font-bold text-[15px] mb-1">{t.mission.how1Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.how1Body}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-white font-bold text-[15px] mb-1">{t.mission.how2Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.how2Body}</p>
        </div>
      </div>

      <a
        href={BEACON}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-accent text-white font-bold py-3 rounded-lg mb-3 hover:opacity-90"
      >
        {t.mission.ctaSite}
      </a>
      <a
        href={ABOUT}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center border border-border text-muted font-semibold py-3 rounded-lg hover:text-white hover:border-white/30"
      >
        {t.mission.ctaAbout}
      </a>
    </div>
  )
}
