import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useJournalStore } from '../stores/journalStore'
import { auth } from '../lib/firebase'
import { useT } from '../i18n'
import { tpl, formatMoney } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'

function amountFromQuery(raw: string | null): string {
  if (!raw) return ''
  const n = parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return ''
  return String(n)
}

export default function Journal() {
  const { entries, loaded, loadJournal, addEntry } = useJournalStore()
  const currency = useSettingsStore((s) => s.currency) ?? 'PHP'
  const [searchParams, setSearchParams] = useSearchParams()
  const [acknowledged, setAcknowledged] = useState(false)
  const [chasingAcknowledged, setChasingAcknowledged] = useState(false)
  const [amount, setAmount] = useState(() => amountFromQuery(searchParams.get('amount')))
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const t = useT()

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
      setAmount('')
      setText('')
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
      <h2 className="text-lg font-extrabold text-white mb-1">{t.journal.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.journal.interceptSub}</p>

      {mustIntercept && mostRecent && (
        <div className="border-2 border-accent rounded-xl p-5 mb-6 bg-surface">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-1">{t.journal.interceptTitle}</p>
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
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{mostRecent.text}</p>
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-1">{t.journal.chasingTitle}</p>
          <div className="bg-bg rounded-lg p-4 mb-4 border-l-4 border-red-500">
            <p className="text-white text-[15px] leading-relaxed mb-2">{t.journal.chasingBody1}</p>
            <p className="text-white text-[15px] leading-relaxed mb-2">{t.journal.chasingBody2}</p>
            <p className="text-white text-[15px] leading-relaxed">{t.journal.chasingBody3}</p>
          </div>
          <button
            onClick={() => setChasingAcknowledged(true)}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg text-sm"
          >
            {t.journal.chasingBtn}
          </button>
        </div>
      )}

      {(!mustIntercept && !mustShowChasingWarning) && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            {t.journal.labelAmount}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t.journal.placeholderAmount}
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
          />
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            {t.journal.labelFeeling}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.journal.placeholderFeeling}
            rows={5}
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4 resize-y"
          />
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
          >
            {saving ? '...' : t.journal.recordBtn}
          </button>
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
                <p className="text-[11px] text-muted uppercase tracking-wider mb-1">
                  {e.createdAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  {e.amount > 0 && ` · ${formatMoney(e.amount, currency)} lost`}
                </p>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{e.text}</p>
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
