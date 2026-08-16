import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useT } from '../i18n'
import { HELP_REGIONS, helpResourcesFor, resolveHelpRegion, type HelpCategory } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'

const TABS: HelpCategory[] = ['crisis', 'exclusion', 'meetings', 'guides']

export default function FindHelp() {
  const t = useT()
  const region = resolveHelpRegion(useSettingsStore((s) => s.helpRegion))
  const [tab, setTab] = useState<HelpCategory>('crisis')
  const items = helpResourcesFor(region).filter((r) => r.category === tab)
  const regionLabel = HELP_REGIONS.find((r) => r.code === region)?.label ?? region

  const labels: Record<HelpCategory, string> = {
    crisis: t.findHelp.tabCrisis,
    exclusion: t.findHelp.tabExclusion,
    meetings: t.findHelp.tabMeetings,
    guides: t.findHelp.tabGuides,
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.findHelp.title}</h2>
      <p className="text-sm text-muted mb-4 leading-relaxed">{t.findHelp.subtitle}</p>
      <p className="text-xs text-muted mb-5">
        {t.findHelp.regionHint}{' '}
        <NavLink to="/settings" className="text-accent hover:text-ink">{regionLabel}</NavLink>
      </p>

      <div className="flex gap-1 mb-5 overflow-x-auto bg-surface border border-border rounded-xl p-1">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 min-w-fit px-2 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
              tab === id ? 'bg-surface2 text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {labels[id]}
          </button>
        ))}
      </div>

      {items.length === 0 && <p className="text-sm text-muted">{t.findHelp.empty}</p>}

      <div className="space-y-3">
        {items.map((item) => {
          const internal = item.url?.startsWith('/')
          return (
            <div key={item.id} className="bg-surface border border-border rounded-xl p-5">
              <p className="text-ink font-bold text-[0.9375rem] mb-1">{item.title}</p>
              <p className="text-sm text-muted leading-relaxed">{item.body}</p>
              {item.url && (
                internal ? (
                  <NavLink
                    to={item.url}
                    className="inline-block mt-3 text-xs font-bold text-accent border border-accent-dim px-3 py-1.5 rounded-lg hover:bg-accent-dim"
                  >
                    {item.action} →
                  </NavLink>
                ) : (
                  <a
                    href={item.url}
                    target={item.url.startsWith('tel:') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-bold text-accent border border-accent-dim px-3 py-1.5 rounded-lg hover:bg-accent-dim"
                  >
                    {item.action} →
                  </a>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
