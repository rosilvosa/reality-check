import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { auth } from '../lib/firebase'

export default function SweatHours() {
  const { monthlyPay, hoursPerMonth, loaded, loadSettings } = useSettingsStore()
  const [loss, setLoss] = useState('')
  const [result, setResult] = useState<{ hours: number; days: number; rate: number } | null>(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadSettings()
    })
    return unsub
  }, [loaded, loadSettings])

  function calculate() {
    const lossVal = parseFloat(loss)
    if (!lossVal || lossVal <= 0) return
    const rate = monthlyPay / hoursPerMonth
    const hours = lossVal / rate
    const days = hours / 8
    setResult({ hours, days, rate })
  }

  const notConfigured = loaded && monthlyPay === 0

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">Sweat Hours Calculator</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">
        Every loss is hours of your life you will never get back. This makes that real.
      </p>

      {notConfigured && (
        <div className="mb-4 p-3 rounded-lg bg-accent-dim border border-accent text-sm text-white">
          ⚠ Set your monthly pay in <strong>⚙ Settings</strong> first.
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Loss Amount (₱)
        </label>
        <input
          type="number"
          value={loss}
          onChange={(e) => setLoss(e.target.value)}
          placeholder="e.g. 5000"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        />
        <button
          onClick={calculate}
          disabled={notConfigured || !loss}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          CALCULATE THE REAL COST
        </button>
      </div>

      {result && (
        <div className="bg-surface border-l-4 border-accent rounded-r-xl p-5">
          <span className="block text-2xl font-extrabold text-accent mb-3">
            {result.hours.toFixed(1)} hours of your life.
          </span>
          <p className="text-white leading-relaxed text-[15px]">
            You did not just lose ₱{parseFloat(loss).toLocaleString()}.<br />
            You threw away <strong>{result.hours.toFixed(1)} hours</strong> of hard physical labor —
            that is <strong>{result.days.toFixed(1)} full working days</strong>.<br /><br />
            At ₱{result.rate.toFixed(2)}/hr, you must sit at your desk and work{' '}
            <strong>{Math.ceil(result.hours)} hours straight</strong> just to recover this loss.
          </p>
        </div>
      )}

      {loaded && monthlyPay > 0 && (
        <p className="mt-4 text-xs text-muted">
          Rate: ₱{monthlyPay.toLocaleString()} ÷ {hoursPerMonth} hrs = ₱{(monthlyPay / hoursPerMonth).toFixed(2)}/hr
        </p>
      )}
    </div>
  )
}
