import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import type { Asset } from '@rc/core'

const LS_KEY = 'rc_onboarded'

const DEFAULT_ASSETS: Asset[] = [
  { name: '1 Week of Groceries', cost: 1500 },
  { name: '1 Month of Rent', cost: 8000 },
  { name: '1 Month of Utilities', cost: 2000 },
  { name: '1 Month of Medicine', cost: 1200 },
]

export default function Onboarding() {
  const { loaded, monthlyPay, saveSettings } = useSettingsStore()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(1)

  // Income state
  const [monthly, setMonthly] = useState('')
  const [hours, setHours] = useState('176')

  // Assets state
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS)

  useEffect(() => {
    if (!loaded) return
    const done = localStorage.getItem(LS_KEY)
    if (!done && monthlyPay === 0) setVisible(true)
  }, [loaded, monthlyPay])

  function skip() {
    localStorage.setItem(LS_KEY, '1')
    setVisible(false)
  }

  async function finish() {
    const validAssets = assets.filter((a) => a.name.trim() && a.cost > 0)
    await saveSettings({
      monthlyPay: parseFloat(monthly) || 0,
      hoursPerMonth: parseFloat(hours) || 176,
      assets: validAssets,
    })
    localStorage.setItem(LS_KEY, '1')
    setVisible(false)
  }

  function updateAsset(i: number, field: 'name' | 'cost', value: string) {
    setAssets((prev) =>
      prev.map((a, idx) =>
        idx === i ? { ...a, [field]: field === 'cost' ? parseFloat(value) || 0 : value } : a,
      ),
    )
  }

  const rate = monthly && hours
    ? (parseFloat(monthly) / (parseFloat(hours) || 176)).toFixed(2)
    : null

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col overflow-y-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-accent' : s < step ? 'w-4 bg-accent/50' : 'w-4 bg-surface2'
              }`}
            />
          ))}
        </div>
        <button onClick={skip} className="text-xs text-muted hover:text-white transition-colors">
          Skip
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-lg w-full mx-auto">

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div>
            <p className="text-[11px] tracking-widest uppercase text-muted font-bold mb-4">
              Gambling Recovery Tool
            </p>
            <h1 className="text-5xl font-black text-white leading-none mb-4">
              Reality<br />Check
            </h1>
            <p className="text-accent font-bold text-lg mb-6">Break the digital money illusion.</p>
            <p className="text-white text-[15px] leading-relaxed mb-4">
              Gambling turns money into abstract numbers on a screen. This app forces you to confront what every loss actually costs — in hours of your life, weeks of groceries, and months of rent.
            </p>
            <p className="text-white text-[15px] leading-relaxed mb-10">
              The psychology is simple: when losses become real things you can picture, the urge to gamble weakens. Every feature in this app is built around that principle.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-accent text-white font-black py-4 rounded-xl text-sm tracking-wider hover:opacity-90 transition-opacity"
            >
              GET STARTED
            </button>
          </div>
        )}

        {/* ── Step 2: Income ── */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Your Income</h2>
            <p className="text-muted text-sm leading-relaxed mb-8">
              This is what makes the calculator honest. Every loss will be converted into real hours of your life.
            </p>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
              Monthly Take-Home Pay (₱)
            </label>
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full bg-surface2 border border-border rounded-lg px-4 py-3 text-white text-base outline-none focus:border-accent mb-5"
              autoFocus
            />

            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
              Working Hours Per Month
            </label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="176"
              className="w-full bg-surface2 border border-border rounded-lg px-4 py-3 text-white text-base outline-none focus:border-accent mb-2"
            />

            {rate && (
              <p className="text-sm text-muted mb-8">
                → Your hourly rate: <strong className="text-white">₱{rate}/hr</strong>
              </p>
            )}
            {!rate && <div className="mb-8" />}

            <button
              onClick={() => setStep(3)}
              disabled={!monthly}
              className="w-full bg-accent text-white font-black py-4 rounded-xl text-sm tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              NEXT
            </button>
          </div>
        )}

        {/* ── Step 3: Assets ── */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Real-Life Costs</h2>
            <p className="text-muted text-sm leading-relaxed mb-6">
              These are the things your money actually pays for. Every loss will be compared to these. Adjust the numbers to match your life.
            </p>

            <div className="space-y-2 mb-3">
              {assets.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => updateAsset(i, 'name', e.target.value)}
                    placeholder="e.g. 1 Week of Groceries"
                    className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    value={a.cost || ''}
                    onChange={(e) => updateAsset(i, 'cost', e.target.value)}
                    placeholder="₱"
                    className="w-24 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => setAssets((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-muted hover:text-accent border border-border rounded-lg px-2.5 py-2.5 text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAssets((prev) => [...prev, { name: '', cost: 0 }])}
              className="text-sm text-muted border border-border rounded-lg px-3 py-2 hover:text-white transition-colors mb-8"
            >
              + Add Asset
            </button>

            <button
              onClick={finish}
              className="w-full bg-accent text-white font-black py-4 rounded-xl text-sm tracking-wider hover:opacity-90 transition-opacity"
            >
              START RECOVERY
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
