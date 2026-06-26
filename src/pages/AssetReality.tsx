import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { auth } from '../lib/firebase'

export default function AssetReality() {
  const { assets, loaded, loadSettings } = useSettingsStore()
  const [loss, setLoss] = useState('')
  const [calculated, setCalculated] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadSettings()
    })
    return unsub
  }, [loaded, loadSettings])

  const lossVal = parseFloat(loss)

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">Tangible Asset Converter</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">
        Money on a screen feels unreal. Groceries and rent do not.
      </p>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Loss Amount (₱)
        </label>
        <input
          type="number"
          value={loss}
          onChange={(e) => { setLoss(e.target.value); setCalculated(false) }}
          placeholder="e.g. 5000"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-amber mb-4"
        />
        <button
          onClick={() => setCalculated(true)}
          disabled={!lossVal || lossVal <= 0}
          className="w-full bg-amber text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          SEE WHAT YOU BURNED
        </button>
      </div>

      {calculated && lossVal > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
            What ₱{lossVal.toLocaleString()} Actually Means
          </p>
          <p className="text-2xl font-extrabold text-amber mb-4">
            You burned ₱{lossVal.toLocaleString()}
          </p>

          {assets.length === 0 && (
            <p className="text-sm text-muted">No assets configured. Go to ⚙ Settings.</p>
          )}

          {assets.map((a, i) => {
            const units = lossVal / a.cost
            return (
              <div key={i} className="bg-bg rounded-lg p-3 mb-2">
                <p className="font-bold text-white text-sm">{a.name}</p>
                <p className="text-amber text-[15px] mt-0.5">
                  {units >= 1
                    ? <>This loss = <strong>{units.toFixed(1)}×</strong> the cost of {a.name}.</>
                    : <>This loss = <strong>{(units * 100).toFixed(0)}%</strong> of one {a.name}.</>
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
