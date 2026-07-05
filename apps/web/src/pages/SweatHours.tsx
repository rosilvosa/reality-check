import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { auth } from '../lib/firebase'
import { useT } from '../i18n'
import { tpl } from '@rc/core'

export default function SweatHours() {
  const { monthlyPay, hoursPerMonth, loaded, loadSettings } = useSettingsStore()
  const [loss, setLoss] = useState('')
  const [result, setResult] = useState<{ hours: number; days: number; rate: number } | null>(null)
  const t = useT()

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
      <h2 className="text-lg font-extrabold text-white mb-1">{t.sweat.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.sweat.subtitle}</p>

      {notConfigured && (
        <div className="mb-4 p-3 rounded-lg bg-accent-dim border border-accent text-sm text-white">
          {t.sweat.notConfigured}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.sweat.labelLoss}
        </label>
        <input
          type="number"
          value={loss}
          onChange={(e) => setLoss(e.target.value)}
          placeholder={t.sweat.placeholder}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        />
        <button
          onClick={calculate}
          disabled={notConfigured || !loss}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          {t.sweat.btn}
        </button>
      </div>

      {result && (
        <div className="bg-surface border-l-4 border-accent rounded-r-xl p-5">
          <span className="block text-2xl font-extrabold text-accent mb-3">
            {tpl(t.sweat.resultHours, { hours: result.hours.toFixed(1) })}
          </span>
          <p className="text-white leading-relaxed text-[15px] whitespace-pre-line">
            {tpl(t.sweat.resultBody, {
              loss: parseFloat(loss).toLocaleString(),
              hours: result.hours.toFixed(1),
              days: result.days.toFixed(1),
              rate: result.rate.toFixed(2),
              ceilHours: String(Math.ceil(result.hours)),
            })}
          </p>
        </div>
      )}

      {loaded && monthlyPay > 0 && (
        <p className="mt-4 text-xs text-muted">
          {tpl(t.sweat.rateNote, {
            monthly: monthlyPay.toLocaleString(),
            hoursPerMonth: String(hoursPerMonth),
            rate: (monthlyPay / hoursPerMonth).toFixed(2),
          })}
        </p>
      )}
    </div>
  )
}
