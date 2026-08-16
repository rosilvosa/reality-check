import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../stores/settingsStore'
import { auth } from '../lib/firebase'
import { useT } from '../i18n'
import { tpl, formatMoney } from '@rc/core'

export default function Lost() {
  const { monthlyPay, hoursPerMonth, assets, currency, loaded, loadSettings } = useSettingsStore()
  const [loss, setLoss] = useState('')
  const [result, setResult] = useState<{ hours: number; days: number; rate: number } | null>(null)
  const [almost, setAlmost] = useState<null | boolean>(null)
  const [nearInput, setNearInput] = useState('')
  const [reframe, setReframe] = useState('')
  const t = useT()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadSettings()
    })
    return unsub
  }, [loaded, loadSettings])

  const lossVal = parseFloat(loss)
  const notConfigured = loaded && monthlyPay === 0

  function calculate() {
    if (!lossVal || lossVal <= 0) return
    const rate = hoursPerMonth > 0 ? monthlyPay / hoursPerMonth : 0
    const hours = rate > 0 ? lossVal / rate : 0
    const days = hours / 8
    setResult({ hours, days, rate })
    setAlmost(null)
    setNearInput('')
    setReframe('')
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.lost.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.lost.subtitle}</p>

      {notConfigured && (
        <div className="mb-4 p-3 rounded-lg bg-accent-dim border border-accent text-sm text-ink">
          {t.sweat.notConfigured}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label htmlFor="lost-amount" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.sweat.labelLoss}
        </label>
        <input id="lost-amount"
          type="number"
          value={loss}
          onChange={(e) => { setLoss(e.target.value); setResult(null) }}
          placeholder={t.sweat.placeholder}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-4"
        />
        <button
          type="button"
          onClick={calculate}
          disabled={!lossVal || lossVal <= 0}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40"
        >
          {t.sweat.btn}
        </button>
      </div>

      {result && lossVal > 0 && (
        <>
          {result.rate > 0 && (
            <div className="bg-surface border-l-4 border-accent rounded-r-xl p-5 mb-4">
              <span className="block text-2xl font-extrabold text-accent mb-3">
                {tpl(t.sweat.resultHours, { hours: result.hours.toFixed(1) })}
              </span>
              <p className="text-ink leading-relaxed text-[15px] whitespace-pre-line">
                {tpl(t.sweat.resultBody, {
                  loss: formatMoney(lossVal, currency),
                  hours: result.hours.toFixed(1),
                  days: result.days.toFixed(1),
                  rate: formatMoney(result.rate, currency),
                  ceilHours: String(Math.ceil(result.hours)),
                })}
              </p>
            </div>
          )}

          <div className="bg-surface border border-border rounded-xl p-5 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
              {tpl(t.assets.resultTitle, { amount: formatMoney(lossVal, currency) })}
            </p>
            <p className="text-2xl font-extrabold text-ink mb-4">
              {tpl(t.assets.resultBurned, { amount: formatMoney(lossVal, currency) })}
            </p>
            {assets.length === 0 && <p className="text-sm text-muted">{t.assets.noAssets}</p>}
            {assets.map((a, i) => {
              const units = lossVal / a.cost
              return (
                <div key={i} className="bg-bg rounded-lg p-3 mb-2 last:mb-0">
                  <p className="font-bold text-ink text-sm">{a.name}</p>
                  <p className="text-muted text-[15px] mt-0.5">
                    {units >= 1
                      ? tpl(t.assets.unitsGe1, { units: units.toFixed(1), name: a.name })
                      : tpl(t.assets.unitsLt1, { pct: (units * 100).toFixed(0), name: a.name })}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 mb-4">
            <p className="text-ink font-bold text-[15px] mb-3">{t.lost.almostQ}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAlmost(true)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${
                  almost === true ? 'border-accent text-ink bg-accent-dim' : 'border-border text-muted hover:text-ink'
                }`}
              >
                {t.lost.almostYes}
              </button>
              <button
                type="button"
                onClick={() => { setAlmost(false); setReframe('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${
                  almost === false ? 'border-accent text-ink bg-accent-dim' : 'border-border text-muted hover:text-ink'
                }`}
              >
                {t.lost.almostNo}
              </button>
            </div>
          </div>

          {almost === true && (
            <div className="bg-surface border border-border rounded-xl p-5 mb-4">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-dim text-accent px-2 py-0.5 rounded mb-3">
                {t.nearmiss.factTag}
              </span>
              <p className="text-ink text-[15px] leading-relaxed mb-4">{t.nearmiss.factBody}</p>
              <label htmlFor="nearmiss-what" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                {t.nearmiss.labelWhat}
              </label>
              <input id="nearmiss-what"
                type="text"
                value={nearInput}
                onChange={(e) => { setNearInput(e.target.value); setReframe('') }}
                placeholder={t.nearmiss.placeholder}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-3"
              />
              <button
                type="button"
                onClick={() => { if (nearInput.trim()) setReframe(nearInput.trim()) }}
                disabled={!nearInput.trim()}
                className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 mb-3"
              >
                {t.nearmiss.btn}
              </button>
              {reframe && (
                <div className="bg-danger border-2 border-accent rounded-xl p-5 mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-3">{t.nearmiss.overrideTag}</p>
                  <p className="text-ink font-bold text-[15px] leading-relaxed whitespace-pre-line">
                    {tpl(t.nearmiss.overrideBody, { input: reframe })}
                  </p>
                </div>
              )}
              <p className="text-ink text-sm leading-relaxed">{t.nearmiss.truthBody}</p>
            </div>
          )}

          <Link
            to={`/journal?amount=${encodeURIComponent(String(lossVal))}`}
            className="block w-full text-center bg-surface2 border border-border text-ink font-bold py-3 rounded-lg hover:border-accent"
          >
            {t.lost.writeNext} →
          </Link>
        </>
      )}

      {loaded && monthlyPay > 0 && (
        <p className="mt-4 text-xs text-muted">
          {tpl(t.sweat.rateNote, {
            monthly: formatMoney(monthlyPay, currency),
            hoursPerMonth: String(hoursPerMonth),
            rate: formatMoney(monthlyPay / hoursPerMonth, currency),
          })}
        </p>
      )}
    </div>
  )
}
