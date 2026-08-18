import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'
import { RECOVERY_VIDEOS, tpl, type VideoTopic } from '@rc/core'
import TrapTabs from '../components/TrapTabs'

const TOPIC_ORDER: VideoTopic[] = ['psychology', 'recovery']

export default function TrapWhy() {
  const t = useT()

  return (
    <div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.trap.title}</h2>
      <TrapTabs />
      <h3 className="text-base font-extrabold text-ink mb-5">{t.trap.whyTitle}</h3>

      <div className="bg-surface border border-accent-dim rounded-xl p-5 mb-4">
        <span className="inline-block text-[0.6875rem] font-bold uppercase tracking-wider bg-accent-dim text-accent px-2 py-0.5 rounded mb-3">
          {t.trap.skinnerTag}
        </span>
        <p className="text-ink text-[0.9375rem] leading-relaxed mb-4">{t.trap.skinnerP1}</p>
        <p className="text-ink text-[0.9375rem] leading-relaxed mb-4">{t.trap.skinnerP2}</p>
        <p className="text-ink text-[0.9375rem] leading-relaxed mb-4">{t.trap.skinnerP3}</p>
        <div className="bg-bg border-l-4 border-accent rounded-r-lg p-4">
          <p className="text-ink font-bold text-[0.9375rem] leading-relaxed">{t.trap.skinnerCallout}</p>
          <p className="text-accent font-bold text-sm mt-3">{t.trap.skinnerPigeon}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[0.6875rem] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          {t.trap.nearmissTag}
        </span>
        <p className="text-ink text-[0.9375rem] leading-relaxed mb-3">{t.trap.nearmissP1}</p>
        <p className="text-ink text-[0.9375rem] leading-relaxed mb-3">{t.trap.nearmissP2}</p>
        <p className="text-ink text-[0.9375rem] leading-relaxed mb-3">{t.trap.nearmissP3}</p>
        <div className="bg-danger border border-accent-dim rounded-lg p-3">
          <p className="text-accent text-[0.8125rem] font-bold">{t.trap.nearmissCallout}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[0.6875rem] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          {t.trap.darkTag}
        </span>
        <div className="space-y-3">
          {t.trap.dark.map((item) => (
            <div key={item.label} className="bg-bg rounded-lg p-3 border-l-4 border-accent-dim">
              <p className="text-ink text-[0.8125rem] font-bold mb-1">{item.label}</p>
              <p className="text-muted text-[0.8125rem] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.trap.truthTag}</p>
        <p className="text-ink font-bold text-[0.9375rem] leading-relaxed mb-3">{t.trap.truthP1}</p>
        <p className="text-ink text-[0.9375rem] leading-relaxed mb-3">{t.trap.truthP2}</p>
        <p className="text-accent font-bold text-[0.9375rem] leading-relaxed">{t.trap.truthP3}</p>
      </div>

      {RECOVERY_VIDEOS.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">{t.trap.watchTag}</p>
          <p className="text-muted text-xs mb-4">{t.trap.watchHint}</p>
          {TOPIC_ORDER.map((topic) => {
            const inTopic = RECOVERY_VIDEOS.filter((v) => v.topic === topic)
            if (inTopic.length === 0) return null
            return (
              <div key={topic} className="mb-4 last:mb-0">
                <p className="text-ink text-[0.8125rem] font-bold mb-2">
                  {topic === 'psychology' ? t.trap.watchPsychology : t.trap.watchRecovery}
                </p>
                <div className="space-y-2">
                  {inTopic.map((v) => (
                    <a
                      key={v.url}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-bg rounded-lg p-3 border-l-4 border-accent-dim hover:border-accent transition-colors"
                    >
                      <p className="text-ink text-[0.8125rem] font-bold">{v.title}</p>
                      <p className="text-muted text-[0.75rem] mt-0.5">
                        {v.source}
                        {v.minutes !== undefined && (
                          <> &middot; {tpl(t.trap.watchMinutes, { n: String(v.minutes) })}</>
                        )}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <NavLink
        to="/barriers"
        className="block w-full bg-accent text-white font-black py-4 rounded-xl text-center text-sm tracking-wider hover:opacity-90"
      >
        {t.trap.ctaBarriers}
      </NavLink>
    </div>
  )
}
