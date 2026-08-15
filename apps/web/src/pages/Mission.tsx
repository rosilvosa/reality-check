import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'

export default function Mission() {
  const t = useT()

  return (
    <div>
      <NavLink to="/settings" className="text-xs text-muted hover:text-ink mb-4 inline-block">
        ← {t.common.back}
      </NavLink>
      <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-1">{t.mission.tag}</p>
      <h2 className="text-lg font-extrabold text-ink mb-3">{t.mission.title}</h2>
      <p className="text-sm text-muted leading-relaxed mb-4">{t.mission.body1}</p>
      <p className="text-sm text-muted leading-relaxed mb-6">{t.mission.body2}</p>

      <div className="space-y-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-ink font-bold text-[15px] mb-1">{t.mission.belief1Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.belief1Body}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-ink font-bold text-[15px] mb-1">{t.mission.belief2Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.belief2Body}</p>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.mission.howTitle}</p>
      <div className="space-y-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-ink font-bold text-[15px] mb-1">{t.mission.how1Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.how1Body}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-ink font-bold text-[15px] mb-1">{t.mission.how2Title}</p>
          <p className="text-sm text-muted leading-relaxed">{t.mission.how2Body}</p>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="w-full text-center border border-border text-muted font-bold py-3 rounded-lg cursor-not-allowed opacity-70"
      >
        {t.mission.ctaSoon}
      </button>
    </div>
  )
}
