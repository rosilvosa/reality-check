import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'
import { fetchOpenIssues, ISSUES_URL, type Issue } from '../lib/issues'

export default function Updates() {
  const t = useT()
  const [issues, setIssues] = useState<Issue[] | null>(null)
  const [fail, setFail] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchOpenIssues()
      .then((rows) => { if (!cancelled) setIssues(rows) })
      .catch(() => { if (!cancelled) setFail(true) })
    return () => { cancelled = true }
  }, [])

  const bugs = issues?.filter((i) => i.kind === 'bug') ?? []
  const coming = issues?.filter((i) => i.kind === 'feature') ?? []

  return (
    <div>
      <NavLink to="/settings" className="text-xs text-muted hover:text-ink mb-4 inline-block">
        ← {t.common.back}
      </NavLink>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.updates.title}</h2>
      <p className="text-sm text-muted leading-relaxed mb-6">{t.updates.subtitle}</p>

      {fail && <p className="text-sm text-accent mb-4">{t.updates.fail}</p>}
      {!fail && issues === null && <p className="text-sm text-muted mb-4">{t.updates.loading}</p>}

      {issues && (
        <>
          <Section title={t.updates.bugs} empty={t.updates.empty} items={bugs} />
          <Section title={t.updates.features} empty={t.updates.empty} items={coming} />
        </>
      )}

      <a
        href={ISSUES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-muted hover:text-ink py-2"
      >
        {t.updates.openGithub} →
      </a>
    </div>
  )
}

function Section({
  title,
  empty,
  items,
}: {
  title: string
  empty: string
  items: Issue[]
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <a
              key={item.number}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-surface border border-border rounded-xl p-4 hover:border-accent"
            >
              <p className="text-[11px] text-muted mb-1">#{item.number}</p>
              <p className="text-ink text-sm font-semibold leading-snug">{item.title}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
