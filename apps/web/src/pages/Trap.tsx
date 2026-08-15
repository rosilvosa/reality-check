import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'
import { tpl, formatMoney } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'

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
      <h2 className="text-lg font-extrabold text-white mb-1">{t.trap.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.trap.subtitle}</p>

      {/* Section 1: The Skinner Box */}
      <div className="bg-surface border border-accent-dim rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-dim text-accent px-2 py-0.5 rounded mb-3">
          {t.trap.skinnerTag}
        </span>
        <p className="text-white text-[15px] leading-relaxed mb-4">{t.trap.skinnerP1}</p>
        <p className="text-white text-[15px] leading-relaxed mb-4">{t.trap.skinnerP2}</p>
        <p className="text-white text-[15px] leading-relaxed mb-4">{t.trap.skinnerP3}</p>
        <div className="bg-bg border-l-4 border-accent rounded-r-lg p-4">
          <p className="text-white font-bold text-[15px] leading-relaxed">{t.trap.skinnerCallout}</p>
          <p className="text-accent font-bold text-sm mt-3">{t.trap.skinnerPigeon}</p>
        </div>
      </div>

      {/* Section 2: The Near-Miss Science */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          {t.trap.nearmissTag}
        </span>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.nearmissP1}</p>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.nearmissP2}</p>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.nearmissP3}</p>
        <div className="bg-[#0f0a0a] border border-accent-dim rounded-lg p-3">
          <p className="text-accent text-[13px] font-bold">{t.trap.nearmissCallout}</p>
        </div>
      </div>

      {/* Section 3: Mathematical Certainty Calculator */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          {t.trap.calcTag}
        </span>
        <p className="text-sm text-muted mb-4 leading-relaxed">{t.trap.calcSub}</p>

        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.trap.calcLabelBet}
        </label>
        <input
          type="number"
          value={weeklyBet}
          onChange={(e) => { setWeeklyBet(e.target.value); setResult(null) }}
          placeholder="e.g. 500"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        />

        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.trap.calcLabelType}
        </label>
        <select
          value={edgeIndex}
          onChange={(e) => { setEdgeIndex(parseInt(e.target.value)); setResult(null) }}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        >
          {HOUSE_EDGES.map((h, i) => (
            <option key={i} value={i}>
              {t.trap.houseEdgeLabels[i]} ({(h.edge * 100).toFixed(2)}% edge)
            </option>
          ))}
        </select>

        <button
          onClick={calculate}
          disabled={!weeklyBet || parseFloat(weeklyBet) <= 0}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          {t.trap.calcBtn}
        </button>

        {result !== null && (
          <div className="mt-4 bg-[#0f0a0a] border-2 border-accent rounded-xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-3">{t.trap.calcResultTag}</p>
            <p className="text-3xl font-extrabold text-accent mb-2">
              {tpl(t.trap.calcResultYear, { amount: formatMoney(Math.round(result), currency) })}
            </p>
            <p className="text-white text-[15px] leading-relaxed">
              {tpl(t.trap.calcResultBody, {
                bet: formatMoney(parseFloat(weeklyBet), currency),
                type: t.trap.houseEdgeLabels[edgeIndex],
                amount: formatMoney(Math.round(result), currency),
              })}
            </p>
            <p className="text-white text-[15px] leading-relaxed mt-3">
              {tpl(t.trap.calc5year, { amount: formatMoney(Math.round(result * 5), currency) })}
            </p>
            <p className="text-muted text-sm mt-3 leading-relaxed">{t.trap.calcFooter}</p>
          </div>
        )}
      </div>

      {/* Section 4: Dark Patterns */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          {t.trap.darkTag}
        </span>
        <div className="space-y-3">
          {t.trap.dark.map((item) => (
            <div key={item.label} className="bg-bg rounded-lg p-3 border-l-4 border-accent-dim">
              <p className="text-white text-[13px] font-bold mb-1">{item.label}</p>
              <p className="text-muted text-[13px] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Truth */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.trap.truthTag}</p>
        <p className="text-white font-bold text-[15px] leading-relaxed mb-3">{t.trap.truthP1}</p>
        <p className="text-white text-[15px] leading-relaxed mb-3">{t.trap.truthP2}</p>
        <p className="text-accent font-bold text-[15px] leading-relaxed">{t.trap.truthP3}</p>
      </div>

      <NavLink
        to="/barriers"
        className="block w-full bg-accent text-white font-black py-4 rounded-xl text-center text-sm tracking-wider hover:opacity-90 transition-opacity"
      >
        {t.trap.ctaBarriers}
      </NavLink>
    </div>
  )
}
