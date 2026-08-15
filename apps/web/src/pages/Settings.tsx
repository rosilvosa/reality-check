import { useState, useEffect } from 'react'
import { useSearchParams, NavLink } from 'react-router-dom'
import { useT, useLang } from '../i18n'
import { tpl } from '@rc/core'
import { useSettingsStore, Asset } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore } from '../stores/journalStore'
import { useStreakStore } from '../stores/streakStore'
import { auth } from '../lib/firebase'
import { signOut, deleteAccountAndData } from '../lib/auth'
import { createDonationCheckout } from '../lib/paymongo'
import { migrateToFirestore } from '../lib/storage'
import AuthModal from '../components/AuthModal'

const KOFI_URL = 'https://ko-fi.com/rosilvosa'
const DONATE_AMOUNTS = [50, 100, 299]

export default function Settings() {
  const { monthlyPay, hoursPerMonth, assets, voidType, loaded, loadSettings, saveSettings } = useSettingsStore()
  const { user } = useAuthStore()
  const t = useT()
  const { lang, setLang, languages } = useLang()
  const { loadJournal } = useJournalStore()
  const loadStreak = useStreakStore((s) => s.loadStreak)
  const [monthly, setMonthly] = useState('')
  const [hours, setHours] = useState('176')
  const [localAssets, setLocalAssets] = useState<Asset[]>([])
  const [saved, setSaved] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [donateSuccess, setDonateSuccess] = useState(false)
  const [donateError, setDonateError] = useState('')
  const [donateLoading, setDonateLoading] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadSettings()
    })
    return unsub
  }, [loaded, loadSettings])

  useEffect(() => {
    if (searchParams.get('donation') === 'success') {
      setSearchParams({})
      setDonateSuccess(true)
      setTimeout(() => setDonateSuccess(false), 6000)
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
  const isRealUser = !!user && !user.isAnonymous

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
    await saveSettings({
      monthlyPay: monthlyVal,
      hoursPerMonth: hoursVal,
      assets: validAssets,
      voidType,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleDonate(pesos: number) {
    setDonateError('')
    setDonateLoading(pesos)
    try {
      const url = await createDonationCheckout(pesos)
      window.location.href = url
    } catch (e: unknown) {
      setDonateError(e instanceof Error ? e.message : t.settings.donateFail)
      setDonateLoading(null)
    }
  }

  async function handleCustomDonate() {
    const pesos = Math.round(parseFloat(customAmount))
    if (!Number.isFinite(pesos) || pesos < 20) {
      setDonateError(t.settings.donateFail)
      return
    }
    await handleDonate(pesos)
  }

  async function handleDelete() {
    if (!window.confirm(t.settings.deleteConfirm)) return
    setDeleting(true)
    try {
      await deleteAccountAndData()
      window.location.href = '/'
    } catch (e: unknown) {
      setDonateError(e instanceof Error ? e.message : 'Could not delete account')
      setDeleting(false)
    }
  }

  async function afterAuthClose() {
    setShowAuth(false)
    const u = auth.currentUser
    if (u && !u.isAnonymous) {
      await migrateToFirestore(u.uid).catch(console.error)
      await Promise.all([loadSettings(), loadJournal(), loadStreak()])
    }
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">{t.settings.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.settings.subtitle}</p>

      {donateSuccess && (
        <div className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-3 mb-4 text-sm text-green-300 font-semibold">
          {t.settings.donateSuccess}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">{t.settings.accountSection}</p>

        {!isRealUser && (
          <div>
            <p className="text-sm text-muted mb-3">{t.settings.signInHint}</p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full py-2.5 bg-surface2 border border-border text-white font-semibold rounded-lg hover:border-accent transition-colors text-sm"
            >
              {t.settings.signInBtn}
            </button>
          </div>
        )}

        {isRealUser && (
          <div>
            <p className="text-sm font-semibold text-white">{user.email ?? user.displayName ?? 'Signed in'}</p>
            <p className="text-xs text-muted mb-3">{t.settings.syncActive}</p>
            <div className="flex gap-2">
              <button onClick={signOut} className="text-xs text-muted hover:text-white transition-colors border border-border px-3 py-1.5 rounded-lg">
                {t.settings.signOut}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-900 px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                {deleting ? '…' : t.settings.deleteAccount}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.settings.supportSection}</p>
        <p className="text-sm text-muted mb-4 leading-relaxed">{t.settings.supportHint}</p>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {DONATE_AMOUNTS.map((n) => (
            <button
              key={n}
              onClick={() => handleDonate(n)}
              disabled={donateLoading !== null}
              className="py-2.5 bg-accent text-white font-bold rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
            >
              {donateLoading === n ? '…' : `₱${n}`}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={20}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder={t.settings.customAmount}
            className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleCustomDonate}
            disabled={donateLoading !== null}
            className="px-3 py-2 bg-surface2 border border-border text-white font-semibold rounded-lg text-sm hover:border-accent disabled:opacity-50"
          >
            {t.settings.donateNow}
          </button>
        </div>

        {donateError && <p className="text-sm text-accent mb-3">{donateError}</p>}

        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-lg text-muted font-semibold text-sm hover:border-accent hover:text-accent transition-colors"
        >
          {t.settings.kofiBtn}
        </a>
      </div>

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

      <p className="text-center text-xs text-muted mt-4 mb-2">
        <NavLink to="/privacy" className="hover:text-white">{t.settings.privacyLink}</NavLink>
        {' · '}
        <NavLink to="/terms" className="hover:text-white">{t.settings.termsLink}</NavLink>
      </p>

      <AuthModal isOpen={showAuth} onClose={afterAuthClose} />
    </div>
  )
}
