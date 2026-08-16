import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import type { Asset } from '@rc/core'
import { useT } from '../i18n'
import { tpl, formatMoney } from '@rc/core'
import { ONBOARDED_KEY, markOnboarded } from '../lib/pwa'

const DEFAULT_ASSETS: Asset[] = [
  { name: '1 Week of Groceries', cost: 1500 },
  { name: '1 Month of Rent', cost: 8000 },
  { name: '1 Month of Utilities', cost: 2000 },
  { name: '1 Month of Medicine', cost: 1200 },
]

const STEPS = [1, 2, 3, 4] as const

export default function Onboarding() {
  const { loaded, monthlyPay, voidType, currency, helpRegion, saveSettings } = useSettingsStore()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(1)
  const t = useT()

  const [monthly, setMonthly] = useState('')
  const [hours, setHours] = useState('176')
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS)

  useEffect(() => {
    if (!loaded) return
    if (!localStorage.getItem(ONBOARDED_KEY)) setVisible(true)
  }, [loaded])

  function markDone() {
    markOnboarded()
    setVisible(false)
  }

  async function persistSetup() {
    const validAssets = assets.filter((a) => a.name.trim() && a.cost > 0)
    const pay = parseFloat(monthly) || monthlyPay || 0
    await saveSettings({
      monthlyPay: pay,
      hoursPerMonth: parseFloat(hours) || 176,
      assets: validAssets.length ? validAssets : assets.filter((a) => a.cost > 0),
      voidType,
      currency: currency || 'PHP',
      helpRegion: helpRegion || 'PH',
    })
  }

  async function finish() {
    // markDone() must run even if the write fails. This overlay is
    // fixed inset-0 with no dismiss control, so an unhandled rejection
    // here leaves a first-run user permanently locked out of the app.
    // Settings can repair the data later; being trapped is unrecoverable.
    try {
      await persistSetup()
    } finally {
      markDone()
    }
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

  // Order mirrors the real nav: Lost / Journal / Trap / Barriers / Help
  // on the tab bars, then Progress. /sweat, /assets and /nearmiss are now
  // redirects into /lost, so they are no longer separate tabs to teach.
  const tools = [
    t.onboarding.toolLost,
    t.onboarding.toolJournal,
    t.onboarding.toolTrap,
    t.onboarding.toolBarriers,
    t.onboarding.toolHelp,
    t.onboarding.toolProgress,
  ]

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <div className="flex gap-2">
          {STEPS.map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-accent' : s < step ? 'w-4 bg-accent/50' : 'w-4 bg-surface2'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-lg w-full mx-auto">

        {step === 1 && (
          <div>
            <p className="text-[11px] tracking-widest uppercase text-muted font-bold mb-4">{t.onboarding.tag}</p>
            <h1 className="text-4xl font-black text-ink leading-none mb-4">{t.onboarding.title}</h1>
            <p className="text-accent font-bold text-lg mb-6">{t.onboarding.tagline}</p>
            <p className="text-ink text-[15px] leading-relaxed mb-4">{t.onboarding.body1}</p>
            <p className="text-ink text-[15px] leading-relaxed mb-10">{t.onboarding.body2}</p>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-accent text-white font-black py-4 rounded-xl text-sm tracking-wider hover:opacity-90 transition-opacity"
            >
              {t.onboarding.getStarted}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-black text-ink mb-2">{t.onboarding.step2Title}</h2>
            <p className="text-muted text-sm leading-relaxed mb-8">{t.onboarding.step2Sub}</p>

            <label htmlFor="onboarding-pay" className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
              {t.onboarding.step2LabelPay}
            </label>
            <input id="onboarding-pay"
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full bg-surface2 border border-border rounded-lg px-4 py-3 text-ink text-base outline-none focus:border-accent mb-5"
              autoFocus
            />

            <label htmlFor="onboarding-hours" className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
              {t.onboarding.step2LabelHours}
            </label>
            <input id="onboarding-hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="176"
              className="w-full bg-surface2 border border-border rounded-lg px-4 py-3 text-ink text-base outline-none focus:border-accent mb-2"
            />

            {rate && (
              <p className="text-sm text-muted mb-8">
                {tpl(t.onboarding.step2HourlyRate, { rate: formatMoney(parseFloat(rate), currency || 'PHP') })}
              </p>
            )}
            {!rate && <div className="mb-8" />}

            <button
              onClick={() => setStep(3)}
              disabled={!monthly}
              className="w-full bg-accent text-white font-black py-4 rounded-xl text-sm tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {t.onboarding.step2Next}
            </button>
            <button
              onClick={() => setStep(4)}
              className="w-full mt-3 py-3 text-sm text-muted hover:text-ink transition-colors"
            >
              {t.onboarding.laterBtn}
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-3xl font-black text-ink mb-2">{t.onboarding.step3Title}</h2>
            <p className="text-muted text-sm leading-relaxed mb-6">{t.onboarding.step3Sub}</p>

            <div className="space-y-2 mb-3">
              {assets.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => updateAsset(i, 'name', e.target.value)}
                    placeholder={t.onboarding.step3AssetPh}
                    className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-sm outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    value={a.cost || ''}
                    onChange={(e) => updateAsset(i, 'cost', e.target.value)}
                    placeholder={t.settings.assetCostPlaceholder}
                    className="w-24 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setAssets((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="Remove asset"
                    className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-muted hover:text-accent border border-border rounded-lg px-2.5 py-2.5 text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAssets((prev) => [...prev, { name: '', cost: 0 }])}
              className="text-sm text-muted border border-border rounded-lg px-3 py-2 hover:text-ink transition-colors mb-8"
            >
              {t.onboarding.step3Add}
            </button>

            <button
              onClick={() => setStep(4)}
              className="w-full bg-accent text-white font-black py-4 rounded-xl text-sm tracking-wider hover:opacity-90 transition-opacity"
            >
              {t.onboarding.step3Finish}
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-3xl font-black text-ink mb-2">{t.onboarding.toolsTitle}</h2>
            <p className="text-muted text-sm leading-relaxed mb-6">{t.onboarding.toolsSub}</p>
            <ul className="space-y-3 mb-10">
              {tools.map((line) => (
                <li key={line} className="text-ink text-[15px] leading-snug border-l-2 border-accent pl-3">
                  {line}
                </li>
              ))}
            </ul>
            <button
              onClick={finish}
              className="w-full bg-accent text-white font-black py-4 rounded-xl text-sm tracking-wider hover:opacity-90 transition-opacity"
            >
              {t.onboarding.finishCta}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
