import { useState, useEffect } from 'react'
import { useSearchParams, NavLink } from 'react-router-dom'
import { useT, useLang } from '../i18n'
import { tpl } from '@rc/core'

const KOFI_URL = 'https://ko-fi.com/rosilvosa'
import { useSettingsStore, Asset } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore } from '../stores/journalStore'
import { auth } from '../lib/firebase'
import { signOut } from '../lib/auth'
import AuthModal from '../components/AuthModal'
import UpgradeModal from '../components/UpgradeModal'

export default function Settings() {
  const { monthlyPay, hoursPerMonth, assets, loaded, loadSettings, saveSettings } = useSettingsStore()
  const { user, isPro, refreshProStatus } = useAuthStore()
  const t = useT()
  const { lang, setLang, languages } = useLang()
  const { loadJournal } = useJournalStore()
  const [monthly, setMonthly] = useState('')
  const [hours, setHours] = useState('176')
  const [localAssets, setLocalAssets] = useState<Asset[]>([])
  const [saved, setSaved] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadSettings()
    })
    return unsub
  }, [loaded, loadSettings])

  // Handle ?payment=success redirect from PayMongo
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setSearchParams({})
      refreshProStatus().then(() => {
        loadSettings()
        loadJournal()
        setUpgradeSuccess(true)
        setTimeout(() => setUpgradeSuccess(false), 5000)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loaded) {
      setMonthly(monthlyPay > 0 ? String(monthlyPay) : '')
      setHours(String(hoursPerMonth))
      setLocalAssets(assets.map((a) => ({ ...a })))
    }
  }, [loaded, monthlyPay, hoursPerMonth, assets])

  const monthlyVal  = parseFloat(monthly) || 0
  const hoursVal    = parseFloat(hours) || 176
  const derivedRate = monthlyVal > 0 ? (monthlyVal / hoursVal).toFixed(2) : null

  function updateAsset(i: number, field: keyof Asset, value: string) {
    setLocalAssets((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: field === 'cost' ? parseFloat(value) || 0 : value }
      return next
    })
  }

  function removeAsset(i: number) {
    setLocalAssets((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addAsset() {
    setLocalAssets((prev) => [...prev, { name: '', cost: 0 }])
  }

  async function handleSave() {
    const validAssets = localAssets.filter((a) => a.name.trim() && a.cost > 0)
    await saveSettings({ monthlyPay: monthlyVal, hoursPerMonth: hoursVal, assets: validAssets })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isRealUser = !!user && !user.isAnonymous

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">{t.settings.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.settings.subtitle}</p>

      {/* ── Account Section ── */}
      {upgradeSuccess && (
        <div className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-3 mb-4 text-sm text-green-300 font-semibold">
          ✓ Pro activated! Your data now syncs across all devices.
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">{t.settings.accountSection}</p>

        {!isRealUser && (
          <div>
            <p className="text-sm text-muted mb-3">
              Sign in to back up your journal and access your data on any device.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full py-2.5 bg-surface2 border border-border text-white font-semibold rounded-lg hover:border-accent transition-colors text-sm"
            >
              Sign In / Create Account
            </button>
          </div>
        )}

        {isRealUser && isPro && (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block bg-accent/20 text-accent text-xs font-bold px-2 py-0.5 rounded">PRO</span>
                <span className="text-sm font-semibold text-white">Cloud Sync Active</span>
              </div>
              <p className="text-xs text-muted">{user.email ?? user.displayName ?? 'Signed in'}</p>
            </div>
            <button onClick={signOut} className="text-xs text-muted hover:text-white transition-colors border border-border px-3 py-1.5 rounded-lg">
              Sign Out
            </button>
          </div>
        )}

        {isRealUser && !isPro && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-white">{user.email ?? user.displayName ?? 'Signed in'}</p>
                <p className="text-xs text-muted">Free — data on this device only</p>
              </div>
              <button onClick={signOut} className="text-xs text-muted hover:text-white transition-colors border border-border px-3 py-1.5 rounded-lg">
                Sign Out
              </button>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full py-2.5 bg-accent text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Upgrade to Pro — ₱299 once
            </button>
          </div>
        )}
      </div>

      {/* ── Income ── */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">{t.settings.incomeSection}</p>

        <label className="block text-xs font-bold text-muted mb-1.5">{t.settings.labelMonthly}</label>
        <input
          type="number"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
          placeholder="e.g. 25000"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        />

        <label className="block text-xs font-bold text-muted mb-1.5">{t.settings.labelHours}</label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="176"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-2"
        />

        {derivedRate && (
          <p className="text-sm text-muted">{tpl(t.settings.hourlyRate, { rate: derivedRate })}</p>
        )}
      </div>

      {/* ── Assets ── */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">{t.settings.assetsSection}</p>
        <p className="text-sm text-muted mb-4">{t.settings.assetsHint}</p>

        <div className="space-y-2 mb-3">
          {localAssets.map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={a.name}
                onChange={(e) => updateAsset(i, 'name', e.target.value)}
                placeholder={t.settings.assetNamePlaceholder}
                className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-accent"
              />
              <input
                type="number"
                value={a.cost || ''}
                onChange={(e) => updateAsset(i, 'cost', e.target.value)}
                placeholder="Cost (₱)"
                className="w-28 bg-surface2 border border-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-accent"
              />
              <button
                onClick={() => removeAsset(i)}
                className="text-muted hover:text-accent border border-border rounded-lg px-2.5 py-2 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button onClick={addAsset} className="text-sm text-muted border border-border rounded-lg px-3 py-2 hover:text-white transition-colors">
          {t.settings.addAsset}
        </button>
      </div>

      {/* ── Ko-fi ── */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.settings.supportSection}</p>
        <p className="text-sm text-muted mb-4 leading-relaxed">{t.settings.supportHint}</p>
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 border border-border rounded-lg text-white font-bold text-sm hover:border-accent hover:text-accent transition-colors"
        >
          {t.settings.kofiBtn}
        </a>
      </div>

      {/* ── Recovery Tools ── */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.settings.recoveryTools}</p>
        <NavLink
          to="/barriers"
          className="flex items-center justify-between w-full text-left hover:bg-surface2 rounded-lg px-3 py-2.5 transition-colors group"
        >
          <div>
            <p className="text-white font-semibold text-sm">{t.settings.barriersTitle}</p>
            <p className="text-muted text-xs">{t.settings.barriersDesc}</p>
          </div>
          <span className="text-muted group-hover:text-white transition-colors text-sm">→</span>
        </NavLink>
      </div>

      {/* Language Selector */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.settings.langSection}</p>
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                lang === l.code
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface2 text-muted border-border hover:border-accent hover:text-white'
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#0891b2] text-white font-bold py-3 rounded-lg transition-opacity hover:opacity-90"
      >
        {saved ? t.settings.savedBtn : t.settings.saveBtn}
      </button>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onNeedAuth={() => setShowAuth(true)}
        isSignedIn={isRealUser}
      />
    </div>
  )
}
