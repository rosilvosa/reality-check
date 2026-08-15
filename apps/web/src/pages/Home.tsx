import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { formatMoney } from '@rc/core'
import { useStreakStore } from '../stores/streakStore'
import { useJournalStore } from '../stores/journalStore'
import { useSettingsStore } from '../stores/settingsStore'

function isCheckedInToday(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return false
  return lastCheckInDate === new Date().toISOString().slice(0, 10)
}

export default function Home() {
  const t = useT()
  const { currentStreak, lastCheckInDate, loading, checkIn } = useStreakStore()
  const entries = useJournalStore((s) => s.entries)
  const currency = useSettingsStore((s) => s.currency) ?? 'PHP'
  const checkedIn = isCheckedInToday(lastCheckInDate)
  const latest = entries[0]

  return (
    <div>
      <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-4">{t.home.tag}</p>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        {currentStreak > 0 ? (
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <div className="text-5xl font-black text-white leading-none">{currentStreak}</div>
              <div className="text-muted text-xs font-semibold uppercase tracking-wider mt-1">{t.home.daysLabel}</div>
            </div>
            <Link to="/progress" className="text-xs font-bold text-muted hover:text-white shrink-0">
              {t.home.seeProgress} →
            </Link>
          </div>
        ) : (
          <p className="text-white text-sm mb-4">{t.home.startHint}</p>
        )}

        {checkedIn ? (
          <div className="w-full py-3.5 bg-surface2 text-muted font-black rounded-xl text-sm text-center tracking-wide">
            {t.home.checkedIn}
          </div>
        ) : (
          <button
            type="button"
            onClick={checkIn}
            disabled={loading}
            className="w-full py-3.5 bg-accent text-white font-black rounded-xl text-sm tracking-wide hover:opacity-90 disabled:opacity-50"
          >
            {t.home.checkInNow}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <Link
          to="/sweat"
          className="block bg-surface border border-border rounded-2xl p-5 hover:border-accent transition-colors"
        >
          <p className="text-white font-black text-lg">{t.home.lostBtn}</p>
          <p className="text-muted text-sm mt-1">{t.home.lostHint}</p>
        </Link>
        <Link
          to="/journal"
          className="block bg-surface border border-border rounded-2xl p-5 hover:border-accent transition-colors"
        >
          <p className="text-white font-black text-lg">{t.home.writeBtn}</p>
          <p className="text-muted text-sm mt-1">{t.home.writeHint}</p>
        </Link>
      </div>

      {latest && (
        <Link to="/journal" className="block bg-surface border border-border rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2">{t.home.lastEntry}</p>
          {latest.amount > 0 && (
            <p className="text-xs text-muted mb-1">{formatMoney(latest.amount, currency)}</p>
          )}
          <p className="text-white text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{latest.text}</p>
        </Link>
      )}
    </div>
  )
}
