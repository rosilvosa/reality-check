import { useStreakStore } from '../stores/streakStore'
import { useSettingsStore } from '../stores/settingsStore'
import VoidSection from '../components/VoidSection'

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365]

const BADGE: Record<number, string> = {
  1: '🌱', 3: '🌿', 7: '🔥', 14: '⚡', 30: '🏆', 60: '💎', 90: '🛡️', 180: '👑', 365: '🌟',
}

function toDateLabel(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', { dateStyle: 'medium' })
}

function isCheckedInToday(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return false
  return lastCheckInDate === new Date().toISOString().slice(0, 10)
}

export default function Progress() {
  const {
    currentStreak, longestStreak, lastCheckInDate, milestonesSeen,
    startDate, loading, checkIn,
  } = useStreakStore()
  const { assets } = useSettingsStore()

  const checkedInToday = isCheckedInToday(lastCheckInDate)
  const totalSaved = useStreakStore.getState().getTotalSaved()

  const nextMilestone = MILESTONES.find((m) => m > currentStreak)

  const assetLines = (assets ?? [])
    .filter((a) => a.cost > 0 && totalSaved > 0)
    .map((a) => ({ name: a.name, units: totalSaved / a.cost }))

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <p className="text-[11px] tracking-widest text-muted uppercase mb-1">Gambling Recovery Tool</p>
      <h1 className="text-2xl font-black text-white mb-6">Progress</h1>

      {/* Current streak */}
      <div className="bg-[#111118] border border-[#232330] rounded-xl p-6 mb-4 text-center">
        {currentStreak > 0 ? (
          <>
            <div className="text-7xl font-black text-white leading-none">{currentStreak}</div>
            <div className="text-muted text-sm font-semibold mt-1 mb-3 uppercase tracking-wider">days clean</div>
            <div className="text-[12px] text-muted">
              Last check-in: {toDateLabel(lastCheckInDate)}
            </div>
            <div className="text-[12px] text-muted mt-1">
              Personal best: <span className="text-white font-bold">{longestStreak} days</span>
            </div>
          </>
        ) : (
          <div className="py-4">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-white font-bold text-lg">Start your streak today.</div>
            {longestStreak > 0 && (
              <div className="text-muted text-sm mt-2">
                Personal best: {longestStreak} days
              </div>
            )}
          </div>
        )}
      </div>

      {/* Check-in */}
      <div className="bg-[#111118] border border-[#232330] rounded-xl p-5 mb-4">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">Daily Check-In</div>
        {checkedInToday ? (
          <button
            disabled
            className="w-full py-3 bg-[#18181f] text-muted font-black rounded-lg text-sm tracking-wider cursor-not-allowed"
          >
            ✓ CHECKED IN TODAY
          </button>
        ) : (
          <button
            onClick={checkIn}
            disabled={loading}
            className="w-full py-3 bg-accent text-white font-black rounded-lg text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            I AM CLEAN TODAY
          </button>
        )}
        <p className="text-muted text-[12px] text-center mt-3">
          Tap once per day to keep your streak alive. Miss a day and it resets.
        </p>
      </div>

      {/* Streak reset message */}
      {currentStreak === 0 && startDate !== null && (
        <div className="border border-accent rounded-xl p-4 mb-4 bg-[#1a0a0a]">
          <p className="text-white text-sm font-semibold">
            Your streak reset. That's not failure — that's data. Start again.
          </p>
        </div>
      )}

      {/* What you've protected */}
      {totalSaved > 0 && (
        <div className="bg-[#111118] border border-[#232330] rounded-xl p-5 mb-4">
          <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">What You've Protected</div>
          <div className="text-[11px] text-muted mb-2">Since you started, you've protected:</div>
          <div className="text-2xl font-black text-white mb-3">
            ₱{totalSaved.toLocaleString()}
          </div>
          {assetLines.length > 0 ? (
            <div className="space-y-2">
              {assetLines.map((a) => (
                <div key={a.name} className="flex justify-between items-center text-sm">
                  <span className="text-muted">{a.name}</span>
                  <span className="text-white font-bold">{a.units.toFixed(1)}×</span>
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
      <div className="bg-[#111118] border border-[#232330] rounded-xl p-5 mb-4">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-4">Milestones</div>
        <div className="grid grid-cols-3 gap-3">
          {MILESTONES.map((m) => {
            const unlocked = milestonesSeen.includes(m) || currentStreak >= m
            const isNext = m === nextMilestone
            return (
              <div
                key={m}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  unlocked
                    ? 'border-accent bg-[#1a0a0a]'
                    : isNext
                    ? 'border-accent/40 bg-[#111118]'
                    : 'border-[#232330] bg-[#0d0d14]'
                }`}
              >
                <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-30'}`}>
                  {unlocked ? BADGE[m] : '🔒'}
                </span>
                <span className={`text-[11px] font-bold mt-1 ${unlocked ? 'text-white' : 'text-muted'}`}>
                  {m}d
                </span>
                {isNext && !unlocked && (
                  <span className="text-[9px] text-accent mt-0.5">next</span>
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
