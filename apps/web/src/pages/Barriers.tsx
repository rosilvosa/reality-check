import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const LS_KEY = 'rc_barriers'

const BARRIERS = [
  {
    id: 'self_exclusion',
    title: 'Register for Self-Exclusion',
    description:
      'PAGCOR runs a self-exclusion program that bans you from all licensed casinos in the Philippines. Contact them directly to register.',
    action: { label: 'pagcor.gov.ph', url: 'https://www.pagcor.gov.ph' },
  },
  {
    id: 'delete_apps',
    title: 'Delete All Betting Apps',
    description:
      'Remove every gambling app from your phone right now. Not archive — delete. Including the ones you "only use sometimes." All of them.',
    action: null,
  },
  {
    id: 'block_sites',
    title: 'Block Betting Websites',
    description:
      'Install a site blocker (BlockSite on Chrome/Android, 1Blocker on iOS) and add every site you use. Set a password you will not remember. Make the path back require effort.',
    action: null,
  },
  {
    id: 'payment_methods',
    title: 'Remove Saved Payment Methods',
    description:
      'Log into every betting account and delete your saved GCash, Maya, or card details. Friction stops impulsive deposits. Every extra step is money you keep.',
    action: null,
  },
  {
    id: 'tell_someone',
    title: 'Tell One Trusted Person',
    description:
      'Accountability works. Tell one person — a family member, a friend, anyone you trust. You do not have to explain everything. Just: "I am trying to stop gambling and I need you to know."',
    action: null,
  },
  {
    id: 'helpline',
    title: 'Save a Helpline Number',
    description:
      'NCMH Crisis Line: 1553. Free, 24/7, covers addiction. Save the number now — not when you need it, because when you need it you will not look it up.',
    action: { label: 'Save 1553', url: 'tel:1553' },
  },
]

export default function Barriers() {
  const [done, setDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setDone(new Set(JSON.parse(raw)))
    } catch { /* ignore */ }
  }, [])

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(LS_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const count = done.size
  const total = BARRIERS.length
  const allDone = count === total

  return (
    <div>
      <NavLink to="/trap" className="text-xs text-muted hover:text-white transition-colors mb-4 inline-block">
        ← Back to The Trap
      </NavLink>

      <h2 className="text-lg font-extrabold text-white mb-1">Build Your Barriers</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">
        The trap only works when access is easy. Every barrier you add makes gambling harder. Harder means fewer relapses.
      </p>

      {/* Progress bar */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Barriers in Place</span>
          <span className={`text-sm font-black ${allDone ? 'text-green-400' : 'text-white'}`}>
            {count} / {total}
          </span>
        </div>
        <div className="w-full bg-surface2 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-accent'}`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
        {allDone && (
          <p className="text-green-400 text-sm font-bold mt-3">
            Every barrier is in place. You have done the hard work. Keep going.
          </p>
        )}
        {!allDone && count > 0 && (
          <p className="text-muted text-xs mt-2">
            {total - count} barrier{total - count !== 1 ? 's' : ''} remaining. Each one makes relapse harder.
          </p>
        )}
      </div>

      {/* Checklist */}
      <div className="space-y-3 mb-6">
        {BARRIERS.map((b) => {
          const checked = done.has(b.id)
          return (
            <div
              key={b.id}
              className={`bg-surface rounded-xl p-5 border transition-all ${
                checked ? 'border-green-800 bg-[#0a1a0a]' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(b.id)}
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
                  <p className={`font-bold text-[15px] mb-1 ${checked ? 'text-muted line-through' : 'text-white'}`}>
                    {b.title}
                  </p>
                  <p className={`text-sm leading-relaxed ${checked ? 'text-muted/60' : 'text-muted'}`}>
                    {b.description}
                  </p>
                  {b.action && !checked && (
                    <a
                      href={b.action.url}
                      target={b.action.url.startsWith('tel:') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs font-bold text-accent border border-accent-dim px-3 py-1.5 rounded-lg hover:bg-accent-dim transition-colors"
                    >
                      {b.action.label} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Closing */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Why This Works</p>
        <p className="text-white text-[15px] leading-relaxed mb-3">
          The betting app on your phone was designed to make access instant and withdrawal slow. Every barrier you create reverses that asymmetry.
        </p>
        <p className="text-white text-[15px] leading-relaxed">
          You do not need willpower if gambling requires 10 steps instead of one tap. Barriers are not about trust. They are about giving your rational brain time to catch up to the urge.
        </p>
      </div>
    </div>
  )
}
