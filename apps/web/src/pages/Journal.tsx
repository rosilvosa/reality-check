import { useState, useEffect } from 'react'
import { useJournalStore } from '../stores/journalStore'
import { auth } from '../lib/firebase'

export default function Journal() {
  const { entries, loaded, loadJournal, addEntry } = useJournalStore()
  const [acknowledged, setAcknowledged] = useState(false)
  const [chasingAcknowledged, setChasingAcknowledged] = useState(false)
  const [amount, setAmount] = useState('')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadJournal()
    })
    return unsub
  }, [loaded, loadJournal])

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    await addEntry({ amount: parseFloat(amount) || 0, text: text.trim() })
    setAmount('')
    setText('')
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
      <h2 className="text-lg font-extrabold text-white mb-1">Loss Journal</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">
        Write immediately after a loss, while the pain is real. Your future self will read this before they can do anything else.
      </p>

      {mustIntercept && mostRecent && (
        <div className="border-2 border-accent rounded-xl p-5 mb-6 bg-surface">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-1">⛔ Stop. Read This First.</p>
          <p className="text-sm text-muted mb-4">
            You wrote this after your last loss on{' '}
            {mostRecent.createdAt.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}.
            You must read it now.
          </p>
          <div className="bg-bg rounded-lg p-4 mb-4 border-l-4 border-accent-dim">
            {mostRecent.amount > 0 && (
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                ₱{mostRecent.amount.toLocaleString()} lost
              </p>
            )}
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{mostRecent.text}</p>
          </div>
          <button
            onClick={() => setAcknowledged(true)}
            className="w-full bg-accent text-white font-bold py-3 rounded-lg text-sm"
          >
            I have read and acknowledged my past pain. Continue.
          </button>
        </div>
      )}

      {mustShowChasingWarning && (
        <div className="border-2 border-red-500 rounded-xl p-5 mb-6 bg-surface">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-1">⛔ Are You Chasing a Loss?</p>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            You already logged a loss today. You are about to log another one.
          </p>
          <div className="bg-bg rounded-lg p-4 mb-4 border-l-4 border-red-500">
            <p className="text-white text-[15px] leading-relaxed font-bold mb-2">
              This is called loss chasing — and it is the most dangerous phase of gambling addiction.
            </p>
            <p className="text-white text-[15px] leading-relaxed mb-2">
              The sunk cost fallacy tells you that because you have already lost so much, you need to keep going to make it worthwhile. But that is not how probability works.
            </p>
            <p className="text-white text-[15px] leading-relaxed mb-2">
              Past losses have <strong>zero effect</strong> on future outcomes. The odds reset every single bet. Your emotions do not.
            </p>
            <p className="text-white text-[15px] leading-relaxed">
              Researchers have found that during loss chasing, the prefrontal cortex — the part of your brain responsible for rational decisions — shows impaired activity. <strong>You are not making decisions right now. Your brain is in survival mode.</strong>
            </p>
          </div>
          <button
            onClick={() => setChasingAcknowledged(true)}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg text-sm"
          >
            I understand. I am still going to journal this loss.
          </button>
        </div>
      )}

      {(!mustIntercept && !mustShowChasingWarning) && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Amount Lost (₱)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
          />
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            How you feel right now — hold nothing back
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write the raw truth. The fear, the regret, the physical pain. Future-you needs to read this."
            rows={5}
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4 resize-y"
          />
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
          >
            {saving ? 'SAVING...' : 'RECORD THIS MOMENT'}
          </button>
        </div>
      )}

      {entries.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Past Entries ({entries.length})
          </p>
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="bg-bg border-l-4 border-accent-dim rounded-r-lg p-3">
                <p className="text-[11px] text-muted uppercase tracking-wider mb-1">
                  {e.createdAt.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                  {e.amount > 0 && ` · ₱${e.amount.toLocaleString()} lost`}
                </p>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-10 text-muted text-sm">
          No entries yet. After a loss, come here immediately and write.
        </div>
      )}
    </div>
  )
}
