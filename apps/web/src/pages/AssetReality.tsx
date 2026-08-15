import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { auth } from '../lib/firebase'
import { useT } from '../i18n'
import { tpl, formatMoney } from '@rc/core'

export default function AssetReality() {
  const { assets, currency, loaded, loadSettings } = useSettingsStore()
  const [loss, setLoss] = useState('')
  const [calculated, setCalculated] = useState(false)
  const t = useT()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadSettings()
    })
    return unsub
  }, [loaded, loadSettings])

  const lossVal = parseFloat(loss)

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">{t.assets.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.assets.subtitle}</p>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.assets.labelLoss}
        </label>
        <input
          type="number"
          value={loss}
          onChange={(e) => { setLoss(e.target.value); setCalculated(false) }}
          placeholder={t.assets.placeholder}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-amber mb-4"
        />
        <button
          onClick={() => setCalculated(true)}
          disabled={!lossVal || lossVal <= 0}
          className="w-full bg-amber text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          {t.assets.btn}
        </button>
      </div>

      {calculated && lossVal > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
            {tpl(t.assets.resultTitle, { amount: formatMoney(lossVal, currency) })}
          </p>
          <p className="text-2xl font-extrabold text-amber mb-4">
            {tpl(t.assets.resultBurned, { amount: formatMoney(lossVal, currency) })}
          </p>

          {assets.length === 0 && (
            <p className="text-sm text-muted">{t.assets.noAssets}</p>
          )}

          {assets.map((a, i) => {
            const units = lossVal / a.cost
            return (
              <div key={i} className="bg-bg rounded-lg p-3 mb-2">
                <p className="font-bold text-white text-sm">{a.name}</p>
                <p className="text-amber text-[15px] mt-0.5">
                  {units >= 1
                    ? tpl(t.assets.unitsGe1, { units: units.toFixed(1), name: a.name })
                    : tpl(t.assets.unitsLt1, { pct: (units * 100).toFixed(0), name: a.name })
                  }
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
