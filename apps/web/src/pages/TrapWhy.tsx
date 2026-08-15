import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'

export default function TrapWhy() {
  const t = useT()

  return (
    <div>
      <NavLink to="/trap" className="text-xs text-muted hover:text-white mb-4 inline-block">
        ← {t.trap.title}
      </NavLink>
      <h2 className="text-lg font-extrabold text-white mb-5">{t.trap.whyTitle}</h2>

      <div className="bg-surface border border-accent-dim rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-dim text-accent px-2 py-0.5 rounded mb-3">
          {t.trap.skinnerTag}
        </span>
        <p className="text-white text-[15px] leading-relaxed mb-4">{t.trap.skinnerP1}</p>
        <p className="text-white text-[15px] leading-relaxed mb-4">{t.trap.skinnerP2}</p>
        <p className="text-white text-[15px] leading-relaxed mb-4">{t.trap.skinnerP3}</p>
        <div className="bg-bg border-l-4 border-accent rounded-r-lg p-4">
          <p className="text-white font-bold text-[15px] leading-relaxed">{t.trap.skinnerCallout}</p>
          <p className="text-accent font-bold text-sm mt-3">{t.trap.skinnerPigeon}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          {t.trap.nearmissTag}
        </span>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.nearmissP1}</p>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.nearmissP2}</p>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.nearmissP3}</p>
        <div className="bg-[#0f0a0a] border border-accent-dim rounded-lg p-3">
          <p className="text-accent text-[13px] font-bold">{t.trap.nearmissCallout}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          {t.trap.darkTag}
        </span>
        <div className="space-y-3">
          {t.trap.dark.map((item) => (
            <div key={item.label} className="bg-bg rounded-lg p-3 border-l-4 border-accent-dim">
              <p className="text-white text-[13px] font-bold mb-1">{item.label}</p>
              <p className="text-muted text-[13px] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.trap.truthTag}</p>
        <p className="text-white font-bold text-[15px] leading-relaxed mb-3">{t.trap.truthP1}</p>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.truthP2}</p>
        <p className="text-accent font-bold text-[15px] leading-relaxed">{t.trap.truthP3}</p>
      </div>

      <NavLink
        to="/barriers"
        className="block w-full bg-accent text-white font-black py-4 rounded-xl text-center text-sm tracking-wider hover:opacity-90"
      >
        {t.trap.ctaBarriers}
      </NavLink>
    </div>
  )
}
