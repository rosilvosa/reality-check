import { useStreakStore } from '../stores/streakStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useJournalStore } from '../stores/journalStore'
import VoidSection from '../components/VoidSection'
import { useT } from '../i18n'
import { tpl, formatMoney, localISODate, visibleStreak, MILESTONES, MILESTONE_EMOJI } from '@rc/core'

function toDateLabel(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function isCheckedInToday(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return false
  return lastCheckInDate === localISODate()
}

export default function Progress() {
  const {
    currentStreak, longestStreak, lastCheckInDate, milestonesSeen,
    startDate, loading, checkIn,
  } = useStreakStore()
  const { assets, currency } = useSettingsStore()
  const t = useT()

  const checkedInToday = isCheckedInToday(lastCheckInDate)
  const days = visibleStreak(currentStreak, lastCheckInDate)
  const journalEntries = useJournalStore((s) => s.entries)
  const totalSaved = journalEntries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  const nextMilestone = MILESTONES.find((m) => m > days)

  const assetLines = (assets ?? [])
    .filter((a) => a.cost > 0 && totalSaved > 0)
    .map((a) => ({ name: a.name, units: totalSaved / a.cost }))

  return (
    <div>
      <h1 className="text-lg font-extrabold text-ink mb-6">{t.progress.title}</h1>

      {/* Current streak */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-4 text-center">
        <div className={`text-7xl font-black leading-none ${loading ? 'text-muted' : 'text-ink'}`}>
          {loading ? '—' : days}
        </div>
        <div className="text-muted text-sm font-semibold mt-1 mb-3 uppercase tracking-wider">{t.progress.daysClean}</div>
        {days === 0 ? (
          <>
            <div className="text-ink font-bold text-lg">{t.progress.startStreak}</div>
            {longestStreak > 0 && (
              <div className="text-muted text-sm mt-2">
                {tpl(t.progress.personalBest, { n: String(longestStreak) })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-[12px] text-muted">
              {tpl(t.progress.lastCheckIn, { date: toDateLabel(lastCheckInDate) })}
            </div>
            <div className="text-[12px] text-muted mt-1">
              {tpl(t.progress.personalBest, { n: String(longestStreak) })}
            </div>
          </>
        )}
      </div>

      {/* Check-in */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">{t.progress.dailyCheckIn}</div>
        {loading ? (
          <div className="w-full py-3 bg-surface2 text-muted font-black rounded-lg text-sm tracking-wider text-center">
            —
          </div>
        ) : checkedInToday ? (
          <button
            disabled
            className="w-full py-3 bg-surface2 text-muted font-black rounded-lg text-sm tracking-wider cursor-not-allowed"
          >
            {t.progress.checkedInBtn}
          </button>
        ) : (
          <button
            onClick={checkIn}
            className="w-full py-3 bg-accent text-white font-black rounded-lg text-sm tracking-wider hover:opacity-90 transition-opacity"
          >
            {t.progress.checkInBtn}
          </button>
        )}
        <p className="text-muted text-[12px] text-center mt-3">{t.progress.checkInHint}</p>
      </div>

      {/* Streak reset message */}
      {days === 0 && startDate !== null && (
        <div className="border border-accent rounded-xl p-4 mb-4 bg-danger">
          <p className="text-ink text-sm font-semibold">{t.progress.resetMsg}</p>
        </div>
      )}

      {/* What you've protected */}
      {totalSaved > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4">
          <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">{t.progress.protectedLabel}</div>
          <div className="text-2xl font-black text-ink mb-3">
            {formatMoney(totalSaved, currency)}
          </div>
          {assetLines.length > 0 ? (
            <div className="space-y-2">
              {assetLines.map((a) => (
                <div key={a.name} className="flex justify-between items-center text-sm">
                  <span className="text-muted">{a.name}</span>
                  <span className="text-ink font-bold">{a.units.toFixed(1)}×</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-xs">Set asset costs in Settings to see equivalents.</p>
          )}
        </div>
      )}

      {/* Fill the Void */}
      <VoidSection />

      {/* Milestone timeline */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-4">{t.progress.milestonesLabel}</div>
        <div className="grid grid-cols-3 gap-3">
          {MILESTONES.map((m) => {
            const unlocked = milestonesSeen.includes(m) || days >= m
            const isNext = m === nextMilestone
            return (
              <div
                key={m}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  unlocked
                    ? 'border-accent bg-danger'
                    : isNext
                    ? 'border-accent/40 bg-surface'
                    : 'border-border bg-bg'
                }`}
              >
                <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-30'}`}>
                  {unlocked ? MILESTONE_EMOJI[m] : '🔒'}
                </span>
                <span className={`text-[11px] font-bold mt-1 ${unlocked ? 'text-ink' : 'text-muted'}`}>
                  {m}d
                </span>
                {isNext && !unlocked && (
                  <span className="text-[9px] text-accent mt-0.5">{t.progress.nextLabel}</span>
                )}
                {unlocked && (
                  <span className="text-[9px] text-accent mt-0.5">✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
