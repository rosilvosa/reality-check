import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { useJournalStore } from '../stores/journalStore'
import { useAuthStore } from '../stores/authStore'
import { useStreakStore } from '../stores/streakStore'
import { auth } from '../lib/firebase'
import { useT, useLang } from '../i18n'
import { tpl, formatMoney, RECOVERY_VIDEOS } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'

function amountFromQuery(raw: string | null): string {
  if (!raw) return ''
  const n = parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return ''
  return String(n)
}

export default function Journal() {
  const { entries, loaded, loadJournal, addEntry, error } = useJournalStore()
  const currency = useSettingsStore((s) => s.currency) ?? 'PHP'
  const [searchParams, setSearchParams] = useSearchParams()
  const [acknowledged, setAcknowledged] = useState(false)
  const [chasingAcknowledged, setChasingAcknowledged] = useState(false)
  const [amount, setAmount] = useState(() => amountFromQuery(searchParams.get('amount')))
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState<{ reset: boolean } | null>(null)
  const authUser = useAuthStore((s) => s.user)
  const isSignedIn = !!authUser && !authUser.isAnonymous
  // One nudge, dismissible for good. A recovery tool should not nag.
  const [nudgeHidden, setNudgeHidden] = useState(() => {
    try { return localStorage.getItem('rc_backup_nudge') === 'off' } catch { return false }
  })
  const showBackupNudge = !isSignedIn && !nudgeHidden && entries.length > 0
  const t = useT()
  const { lang } = useLang()
  // A peer story first (someone else got through this), the psychology
  // group second -- right after logging a loss is not the moment for a
  // lecture. Language-matched when there is one, otherwise the first entry
  // in the group; never hidden by language, same rule Watch.tsx uses.
  const recommendedVideo =
    RECOVERY_VIDEOS.find((v) => v.topic === 'recovery' && v.lang === lang)
    ?? RECOVERY_VIDEOS.find((v) => v.topic === 'recovery')

  useEffect(() => {
    const next = amountFromQuery(searchParams.get('amount'))
    if (next) setAmount(next)
  }, [searchParams])

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadJournal()
    })
    return unsub
  }, [loaded, loadJournal])

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    try {
      await addEntry({ amount: parseFloat(amount) || 0, text: text.trim() })
      // Writing down a loss is telling the app you gambled, so the streak goes.
      const reset = await useStreakStore.getState().recordRelapse()
      setAmount('')
      setText('')
      setJustSaved({ reset })
      if (searchParams.get('amount')) setSearchParams({}, { replace: true })
    } catch {
      /* error shown via store */
    }
    setSaving(false)
  }

  const mostRecent = entries[0]
  const mustIntercept = entries.length > 0 && !acknowledged

  function isToday(date: Date) {
    const now = new Date()
    return date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
  }
  const mostRecentIsToday = !!mostRecent && isToday(mostRecent.createdAt)
  const mustShowChasingWarning = acknowledged && mostRecentIsToday && !chasingAcknowledged

  if (!loaded) {
    return <p className="text-muted text-sm">Loading journal...</p>
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.journal.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.journal.subtitle}</p>

      {mustIntercept && mostRecent && (
        <div className="border-2 border-accent rounded-xl p-5 mb-6 bg-surface">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-accent mb-1">{t.journal.interceptTitle}</p>
          <p className="text-sm text-muted mb-4">
            {t.journal.interceptSub}
            {' '}
            {mostRecent.createdAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
          </p>
          <div className="bg-bg rounded-lg p-4 mb-4 border-l-4 border-accent-dim">
            {mostRecent.amount > 0 && (
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                {formatMoney(mostRecent.amount, currency)} lost
              </p>
            )}
            <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">{mostRecent.text}</p>
          </div>
          <button
            onClick={() => setAcknowledged(true)}
            className="w-full bg-accent text-white font-bold py-3 rounded-lg text-sm"
          >
            {t.journal.acknowledge}
          </button>
        </div>
      )}

      {mustShowChasingWarning && (
        <div className="border-2 border-red-500 rounded-xl p-5 mb-6 bg-surface">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-red-400 mb-1">{t.journal.chasingTitle}</p>
          <div className="bg-bg rounded-lg p-4 mb-4 border-l-4 border-red-500">
            <p className="text-ink text-[0.9375rem] leading-relaxed mb-2">{t.journal.chasingBody1}</p>
            <p className="text-ink text-[0.9375rem] leading-relaxed mb-2">{t.journal.chasingBody2}</p>
            <p className="text-ink text-[0.9375rem] leading-relaxed">{t.journal.chasingBody3}</p>
          </div>
          <button
            onClick={() => setChasingAcknowledged(true)}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg text-sm"
          >
            {t.journal.chasingBtn}
          </button>
        </div>
      )}

      {/* There was no confirmation at all before: the form simply emptied
          itself, which reads as "did that save?" at the worst possible moment. */}
      {justSaved && (
        <div className="border border-accent rounded-xl p-5 mb-6 bg-surface" role="status">
          <p className="text-ink font-bold text-[0.9375rem]">{t.journal.recorded}</p>
          <p className="text-muted text-sm mt-1 leading-relaxed">{t.journal.recordedHint}</p>
          {justSaved.reset && (
            <p className="text-accent text-sm font-bold mt-3 leading-relaxed">{t.journal.streakReset}</p>
          )}
        </div>
      )}

      {/* Two doors out, not a lecture: something to watch (someone else's
          story) and something to do (Fill the Void, on Progress) -- both one
          tap away, neither one more content to read right here. */}
      {justSaved && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.journal.afterTitle}</p>
          <div className="flex flex-col gap-2">
            {recommendedVideo && (
              <NavLink
                to="/watch"
                className="text-sm font-bold text-ink border border-border rounded-lg px-3 py-2.5 hover:border-accent"
              >
                {tpl(t.journal.afterWatch, { title: recommendedVideo.title })} →
              </NavLink>
            )}
            <NavLink
              to="/progress"
              className="text-sm font-bold text-ink border border-border rounded-lg px-3 py-2.5 hover:border-accent"
            >
              {t.journal.afterVoid} →
            </NavLink>
          </div>
        </div>
      )}

      {/* The intercept card shows this same entry, but only until it is
          acknowledged, and acknowledged resets on every visit -- so this is
          the only trace of it left once you are looking at the write form.
          Reuses t.home.lastEntry rather than a new key, since it is the same
          idea Home already shows. */}
      {!mustIntercept && !mustShowChasingWarning && !justSaved && mostRecent && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4">
          <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-muted mb-2">{t.home.lastEntry}</p>
          {mostRecent.amount > 0 && (
            <p className="text-xs text-muted mb-1">{formatMoney(mostRecent.amount, currency)}</p>
          )}
          <p className="text-ink text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{mostRecent.text}</p>
        </div>
      )}

      {(!mustIntercept && !mustShowChasingWarning) && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <label htmlFor="journal-amount" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            {t.journal.labelAmount}
          </label>
          <input id="journal-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t.journal.placeholderAmount}
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-4"
          />
          <label htmlFor="journal-feeling" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            {t.journal.labelFeeling}
          </label>
          <textarea id="journal-feeling"
            value={text}
            onChange={(e) => { setText(e.target.value); if (justSaved) setJustSaved(null) }}
            placeholder={t.journal.placeholderFeeling}
            rows={5}
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-4 resize-y"
          />
          {error && (
            <p role="alert" className="text-sm text-accent mb-3">{t.journal.saveFailed}</p>
          )}
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
          >
            {saving ? '...' : t.journal.recordBtn}
          </button>
        </div>
      )}

      {showBackupNudge && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-5">
          <p className="text-sm text-muted leading-relaxed mb-3">{t.journal.nudgeBody}</p>
          <div className="flex flex-wrap gap-2">
            <NavLink
              to="/settings"
              className="border border-border rounded-lg px-3 py-2 text-xs font-bold text-ink hover:border-accent"
            >
              {t.journal.nudgeAction} →
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setNudgeHidden(true)
                try { localStorage.setItem('rc_backup_nudge', 'off') } catch { /* ignore */ }
              }}
              className="px-3 py-2 text-xs font-bold text-muted hover:text-ink"
            >
              {t.journal.nudgeDismiss}
            </button>
          </div>
        </div>
      )}
      {entries.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            {tpl(t.journal.pastEntries, { n: String(entries.length) })}
          </p>
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="bg-bg border-l-4 border-accent-dim rounded-r-lg p-3">
                <p className="text-[0.6875rem] text-muted uppercase tracking-wider mb-1">
                  {e.createdAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  {e.amount > 0 && ` · ${formatMoney(e.amount, currency)} lost`}
                </p>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-10 text-muted text-sm">
          {t.journal.placeholderFeeling}
        </div>
      )}
    </div>
  )
}
