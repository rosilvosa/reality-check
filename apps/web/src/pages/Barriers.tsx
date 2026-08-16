import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'
import { tpl, REGION_HELP, resolveHelpRegion } from '@rc/core'
import { getAdapter, readLocalBarriersSync } from '../lib/storage'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'

const BARRIER_IDS = [
  'self_exclusion', 'delete_apps', 'block_sites', 'payment_methods', 'tell_someone', 'helpline',
] as const

export default function Barriers() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const isCloud = !!user && !user.isAnonymous
  // Local data is available synchronously, so seed from it and skip the flash.
  const [done, setDone] = useState<Set<string>>(() => new Set(isCloud ? [] : readLocalBarriersSync()))
  const [loaded, setLoaded] = useState(!isCloud)
  const t = useT()
  const helpRegion = resolveHelpRegion(useSettingsStore((s) => s.helpRegion))
  const help = REGION_HELP[helpRegion]


  useEffect(() => {
    if (loading) return
    getAdapter(user)
      .getBarriers()
      .then((ids) => setDone(new Set(ids)))
      .catch(() => undefined)
      .finally(() => setLoaded(true))
  }, [loading, user])

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      getAdapter(user).saveBarriers([...next]).catch(console.error)
      return next
    })
  }

  const ph = helpRegion === 'PH'
  const items = [
    ph
      ? { title: t.barriers.items[0].title, description: t.barriers.items[0].description, actionLabel: t.barriers.items[0].actionLabel, url: help.exclusionUrl }
      : { title: help.exclusionTitle, description: help.exclusionBody, actionLabel: help.exclusionAction, url: help.exclusionUrl },
    { title: t.barriers.items[1].title, description: t.barriers.items[1].description, actionLabel: undefined, url: null },
    { title: t.barriers.items[2].title, description: t.barriers.items[2].description, actionLabel: undefined, url: null },
    { title: t.barriers.items[3].title, description: ph ? t.barriers.items[3].description : help.paymentsBody, actionLabel: undefined, url: null },
    { title: t.barriers.items[4].title, description: t.barriers.items[4].description, actionLabel: undefined, url: null },
    ph
      ? { title: t.barriers.items[5].title, description: t.barriers.items[5].description, actionLabel: t.barriers.items[5].actionLabel, url: help.helplineUrl }
      : { title: help.helplineTitle, description: help.helplineBody, actionLabel: help.helplineAction, url: help.helplineUrl },
  ]

  const count = done.size
  const total = BARRIER_IDS.length
  const allDone = loaded && count === total

  return (
    <div>

      <h2 className="text-lg font-extrabold text-ink mb-1">{t.barriers.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.barriers.subtitle}</p>
      <p className="text-xs text-muted mb-5">
        {t.settings.helpRegionHint}{' '}
        <NavLink to="/settings" className="text-accent hover:text-ink">{t.settings.helpRegionSection}</NavLink>
      </p>

      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">{t.barriers.progressLabel}</span>
          <span className={`text-sm font-black ${allDone ? 'text-green-400' : 'text-ink'}`}>
            {loaded ? count : '—'} / {total}
          </span>
        </div>
        <div className="w-full bg-surface2 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-accent'}`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
        {allDone && (
          <p className="text-green-400 text-sm font-bold mt-3">{t.barriers.allDone}</p>
        )}
        {!allDone && count > 0 && (
          <p className="text-muted text-xs mt-2">
            {tpl(t.barriers.remaining, { n: String(total - count), s: total - count === 1 ? '' : 's' })}
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {BARRIER_IDS.map((id, i) => {
          const checked = loaded && done.has(id)
          const item = items[i]
          return (
            <div
              key={id}
              className={`bg-surface rounded-xl p-5 border transition-all ${
                checked ? 'border-green-800 bg-danger' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(id)}
                  className={`shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
                    checked
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-border bg-surface2 hover:border-accent'
                  }`}
                  aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
                >
                  {checked && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-[15px] mb-1 ${checked ? 'text-muted line-through' : 'text-ink'}`}>
                    {item.title}
                  </p>
                  <p className={`text-sm leading-relaxed ${checked ? 'text-muted/60' : 'text-muted'}`}>
                    {item.description}
                  </p>
                  {item.url && item.actionLabel && !checked && (
                    <a
                      href={item.url}
                      target={item.url.startsWith('tel:') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs font-bold text-accent border border-accent-dim px-3 py-1.5 rounded-lg hover:bg-accent-dim transition-colors"
                    >
                      {item.actionLabel} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.barriers.whyTitle}</p>
        <p className="text-ink text-[15px] leading-relaxed mb-3">{t.barriers.whyP1}</p>
        <p className="text-ink text-[15px] leading-relaxed">{t.barriers.whyP2}</p>
      </div>
    </div>
  )
}
