import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'
import { tpl, formatMoney } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'
import TrapTabs from '../components/TrapTabs'

const HOUSE_EDGES = [
  { edge: 0.0455 },
  { edge: 0.08 },
  { edge: 0.10 },
]

export default function Trap() {
  const [weeklyBet, setWeeklyBet] = useState('')
  const [edgeIndex, setEdgeIndex] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const t = useT()
  const currency = useSettingsStore((s) => s.currency) ?? 'PHP'

  function calculate() {
    const bet = parseFloat(weeklyBet)
    if (!bet || bet <= 0) return
    setResult(bet * 52 * HOUSE_EDGES[edgeIndex].edge)
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.trap.title}</h2>
      <TrapTabs />
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.trap.calcSub}</p>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.trap.calcLabelBet}
        </label>
        <input
          type="number"
          value={weeklyBet}
          onChange={(e) => { setWeeklyBet(e.target.value); setResult(null) }}
          placeholder="e.g. 500"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-4"
        />

        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.trap.calcLabelType}
        </label>
        <select
          value={edgeIndex}
          onChange={(e) => { setEdgeIndex(parseInt(e.target.value)); setResult(null) }}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-4"
        >
          {HOUSE_EDGES.map((h, i) => (
            <option key={i} value={i}>
              {t.trap.houseEdgeLabels[i]} ({(h.edge * 100).toFixed(2)}% edge)
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={calculate}
          disabled={!weeklyBet || parseFloat(weeklyBet) <= 0}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40"
        >
          {t.trap.calcBtn}
        </button>

        {result !== null && (
          <div className="mt-4 bg-danger border-2 border-accent rounded-xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-3">{t.trap.calcResultTag}</p>
            <p className="text-3xl font-extrabold text-accent mb-2">
              {tpl(t.trap.calcResultYear, { amount: formatMoney(Math.round(result), currency) })}
            </p>
            <p className="text-ink text-[15px] leading-relaxed">
              {tpl(t.trap.calcResultBody, {
                bet: formatMoney(parseFloat(weeklyBet), currency),
                type: t.trap.houseEdgeLabels[edgeIndex],
                amount: formatMoney(Math.round(result), currency),
              })}
            </p>
            <p className="text-ink text-[15px] leading-relaxed mt-3">
              {tpl(t.trap.calc5year, { amount: formatMoney(Math.round(result * 5), currency) })}
            </p>
            <p className="text-muted text-sm mt-3 leading-relaxed">{t.trap.calcFooter}</p>
          </div>
        )}
      </div>

      <p className="text-ink font-bold text-[15px] leading-relaxed mb-5">{t.trap.skinnerCallout}</p>

      <NavLink
        to="/barriers"
        className="block w-full bg-accent text-white font-black py-4 rounded-xl text-center text-sm tracking-wider hover:opacity-90"
      >
        {t.trap.ctaBarriers}
      </NavLink>
    </div>
  )
}
