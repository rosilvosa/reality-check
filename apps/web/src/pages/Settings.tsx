import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { NavLink } from 'react-router-dom'
import { useT, useLang } from '../i18n'
import { tpl, CURRENCIES, HELP_REGIONS, formatMoney } from '@rc/core'
import { useSettingsStore, Asset } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore } from '../stores/journalStore'
import { useStreakStore } from '../stores/streakStore'
import { auth } from '../lib/firebase'
import { signOut, deleteAccountAndData } from '../lib/auth'
import { buildBackup, downloadBackup, parseBackup, restoreBackup } from '../lib/backup'
import { migrateToFirestore, syncNowToCloud } from '../lib/storage'
import AuthModal from '../components/AuthModal'


export default function Settings() {
  const { monthlyPay, hoursPerMonth, assets, voidType, currency, helpRegion, loaded, loadSettings, saveSettings } = useSettingsStore()
  const { user } = useAuthStore()
  const t = useT()
  const { lang, setLang, languages } = useLang()
  const { loadJournal } = useJournalStore()
  const loadStreak = useStreakStore((s) => s.loadStreak)
  const streak = useStreakStore()
  const [monthly, setMonthly] = useState('')
  const [hours, setHours] = useState('176')
  const [localAssets, setLocalAssets] = useState<Asset[]>([])
  const [saved, setSaved] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [formError, setFormError] = useState('')
  const [currencyCode, setCurrencyCode] = useState('PHP')
  const [regionCode, setRegionCode] = useState('PH')
  const [deleting, setDeleting] = useState(false)
  const [backupMsg, setBackupMsg] = useState('')
  const [backupErr, setBackupErr] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && !loaded) loadSettings()
    })
    return unsub
  }, [loaded, loadSettings])

  useEffect(() => {
    if (loaded) {
      setMonthly(monthlyPay > 0 ? String(monthlyPay) : '')
      setHours(String(hoursPerMonth))
      setLocalAssets(assets.map((a) => ({ ...a })))
      setCurrencyCode(currency || 'PHP')
      setRegionCode(helpRegion || 'PH')
    }
  }, [loaded, monthlyPay, hoursPerMonth, assets, currency, helpRegion])

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

  async function handleExport() {
    setBackupErr('')
    setBackupMsg('')
    try {
      downloadBackup(await buildBackup(user))
      setBackupMsg(t.backup.exported)
    } catch {
      setBackupErr(t.backup.failed)
    }
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    // Reset immediately so picking the same file twice still fires onChange.
    e.target.value = ''
    if (!f) return
    setBackupErr('')
    setBackupMsg('')
    try {
      const parsed = parseBackup(await f.text())
      const { added } = await restoreBackup(user, parsed)
      setBackupMsg(added > 0 ? tpl(t.backup.done, { n: String(added) }) : t.backup.doneNone)
      await Promise.all([loadSettings(), loadJournal(), loadStreak()])
    } catch {
      setBackupErr(t.backup.failed)
    }
  }
  async function handleSave() {
    const validAssets = localAssets.filter((a) => a.name.trim() && a.cost > 0)
    setFormError('')
    try {
      await saveSettings({
        monthlyPay: monthlyVal,
        hoursPerMonth: hoursVal,
        assets: validAssets,
        voidType,
        currency: currencyCode,
        helpRegion: regionCode,
      })
    } catch {
      // Monthly pay is the one value the whole app depends on. A save that
      // fails silently leaves the user unable to tell saved from failed.
      setFormError(t.settings.saveFailed)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSync() {
    if (!user || user.isAnonymous) return
    setSyncing(true)
    setFormError('')
    try {
      const nextSettings = {
        monthlyPay: monthlyVal,
        hoursPerMonth: hoursVal,
        assets: localAssets.filter((a) => a.name.trim() && a.cost > 0),
        voidType,
        currency: currencyCode,
        helpRegion: regionCode,
      }
      await saveSettings(nextSettings)
      await syncNowToCloud(user.uid, {
        settings: nextSettings,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastCheckInDate: streak.lastCheckInDate,
          milestonesSeen: streak.milestonesSeen,
          startDate: streak.startDate,
        },
      })
      await Promise.all([loadSettings(), loadJournal(), loadStreak()])
      setSynced(true)
      setTimeout(() => setSynced(false), 2500)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : t.settings.syncFail)
    } finally {
      setSyncing(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(t.settings.deleteConfirm)) return
    setDeleting(true)
    try {
      await deleteAccountAndData()
      window.location.href = '/'
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Could not delete account')
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
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.settings.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.settings.subtitle}</p>

      {formError && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 mb-4 text-sm text-red-300">
          {formError}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">{t.settings.accountSection}</p>

        {!isRealUser && (
          <div>
            <p className="text-sm text-muted mb-3">{t.settings.signInHint}</p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full py-2.5 bg-surface2 border border-border text-ink font-semibold rounded-lg hover:border-accent transition-colors text-sm"
            >
              {t.settings.signInBtn}
            </button>
          </div>
        )}

        {isRealUser && (
          <div>
            <p className="text-sm font-semibold text-ink">{user.email ?? user.displayName ?? 'Signed in'}</p>
            <p className="text-xs text-muted mb-3">{t.settings.syncActive}</p>
            <p className="text-xs text-muted mb-2 leading-relaxed">{t.settings.syncNowHint}</p>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="w-full mb-3 py-2.5 bg-surface2 border border-border text-ink font-semibold rounded-lg hover:border-accent transition-colors text-sm disabled:opacity-50"
            >
              {syncing ? t.settings.syncingBtn : synced ? t.settings.syncDoneBtn : t.settings.syncNowBtn}
            </button>
            <div className="flex gap-2">
              <button onClick={signOut} className="text-xs text-muted hover:text-ink transition-colors border border-border px-3 py-1.5 rounded-lg">
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
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.backup.section}</p>
        <p className="text-sm text-muted mb-3 leading-relaxed">{t.backup.hint}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={handleExport}
            className="border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink hover:border-ink/40"
          >
            {t.backup.exportBtn}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink hover:border-ink/40"
          >
            {t.backup.importBtn}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted leading-relaxed mb-1">{t.backup.restoreNote}</p>
        <p className="text-xs text-muted leading-relaxed">{t.backup.privacyNote}</p>
        {backupMsg && <p className="text-sm text-ink font-semibold mt-3">{backupMsg}</p>}
        {backupErr && <p className="text-sm text-accent mt-3">{backupErr}</p>}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.settings.currencySection}</p>
        <p className="text-sm text-muted mb-3 leading-relaxed">{t.settings.currencyHint}</p>
        <select
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-sm outline-none focus:border-accent"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.settings.helpRegionSection}</p>
        <p className="text-sm text-muted mb-3 leading-relaxed">{t.settings.helpRegionHint}</p>
        <select
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-sm outline-none focus:border-accent"
        >
          {HELP_REGIONS.map((r) => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">{t.settings.incomeSection}</p>

        <label htmlFor="settings-monthly" className="block text-xs font-bold text-muted mb-1.5">{t.settings.labelMonthly}</label>
        <input id="settings-monthly"
          type="number"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
          placeholder="e.g. 25000"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-4"
        />

        <label htmlFor="settings-hours" className="block text-xs font-bold text-muted mb-1.5">{t.settings.labelHours}</label>
        <input id="settings-hours"
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="176"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-base outline-none focus:border-accent mb-2"
        />

        {derivedRate && (
          <p className="text-sm text-muted">{tpl(t.settings.hourlyRate, { rate: formatMoney(parseFloat(derivedRate), currencyCode) })}</p>
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
                className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-ink text-sm outline-none focus:border-accent"
              />
              <input
                type="number"
                value={a.cost || ''}
                onChange={(e) => updateAsset(i, 'cost', e.target.value)}
                placeholder={t.settings.assetCostPlaceholder}
                className="w-28 bg-surface2 border border-border rounded-lg px-3 py-2 text-ink text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeAsset(i)}
                aria-label="Remove asset"
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-muted hover:text-accent border border-border rounded-lg px-2.5 py-2 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button onClick={addAsset} className="text-sm text-muted border border-border rounded-lg px-3 py-2 hover:text-ink transition-colors">
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
            <p className="text-ink font-semibold text-sm">{t.settings.barriersTitle}</p>
            <p className="text-muted text-xs">{t.settings.barriersDesc}</p>
          </div>
          <span className="text-muted group-hover:text-ink transition-colors text-sm">→</span>
        </NavLink>
        <NavLink
          to="/help"
          className="flex items-center justify-between w-full text-left hover:bg-surface2 rounded-lg px-3 py-2.5 transition-colors group"
        >
          <div>
            <p className="text-ink font-semibold text-sm">{t.settings.findHelpTitle}</p>
            <p className="text-muted text-xs">{t.settings.findHelpDesc}</p>
          </div>
          <span className="text-muted group-hover:text-ink transition-colors text-sm">→</span>
        </NavLink>
        <NavLink
          to="/community"
          className="flex items-center justify-between w-full text-left hover:bg-surface2 rounded-lg px-3 py-2.5 transition-colors group"
        >
          <div>
            <p className="text-ink font-semibold text-sm">{t.settings.communityTitle}</p>
            <p className="text-muted text-xs">{t.settings.communityDesc}</p>
          </div>
          <span className="text-muted group-hover:text-ink transition-colors text-sm">→</span>
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
                  : 'bg-surface2 text-muted border-border hover:border-accent hover:text-ink'
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-accent text-white font-bold py-3 rounded-lg transition-opacity hover:opacity-90 mb-6"
      >
        {saved ? t.settings.savedBtn : t.settings.saveBtn}
      </button>

      <AuthModal isOpen={showAuth} onClose={afterAuthClose} />
    </div>
  )
}
