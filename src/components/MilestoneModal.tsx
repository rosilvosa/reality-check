import { useStreakStore } from '../stores/streakStore'
import { useSettingsStore } from '../stores/settingsStore'

const BADGE: Record<number, string> = {
  1: '🌱', 3: '🌿', 7: '🔥', 14: '⚡', 30: '🏆', 60: '💎', 90: '🛡️', 180: '👑', 365: '🌟',
}

const MESSAGE: Record<number, string> = {
  1:   'Day one. Most people never get here.',
  3:   'Three days. The urge peaks around now. You beat it.',
  7:   'One week. Your brain is already rewiring.',
  14:  'Two weeks. The cravings are lying to you. Keep going.',
  30:  'Thirty days. One month of choosing yourself.',
  60:  'Two months. This is who you are now.',
  90:  'Ninety days. You\'ve rebuilt your relationship with money.',
  180: 'Half a year. Remember how bad it felt? You chose this instead.',
  365: 'One year. You are not the person who walked in here.',
}

export default function MilestoneModal() {
  const { showMilestoneModal, newMilestone, getTotalSaved, dismissMilestone } = useStreakStore()
  const { assets } = useSettingsStore()

  if (!showMilestoneModal || newMilestone === null) return null

  const totalSaved = getTotalSaved()
  const badge = BADGE[newMilestone] ?? '🏅'
  const message = MESSAGE[newMilestone] ?? `${newMilestone} days clean.`

  const assetLines = (assets ?? [])
    .filter((a) => a.cost > 0)
    .map((a) => `${(totalSaved / a.cost).toFixed(1)}× ${a.name}`)
    .slice(0, 3)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#111118] border-2 border-accent rounded-2xl p-8 text-center">
        <div className="text-7xl mb-4">{badge}</div>
        <h2 className="text-3xl font-black text-white mb-1">
          {newMilestone} {newMilestone === 1 ? 'Day' : 'Days'} Clean.
        </h2>
        {totalSaved > 0 && (
          <p className="text-muted text-sm mb-3">
            You've protected{' '}
            <span className="text-white font-bold">
              ₱{totalSaved.toLocaleString()}
            </span>
            {assetLines.length > 0 && (
              <> — {assetLines.join(', ')}</>
            )}
          </p>
        )}
        <p className="text-white font-semibold text-base leading-relaxed mb-8">
          {message}
        </p>
        <button
          onClick={dismissMilestone}
          className="w-full py-3 bg-accent text-white font-black rounded-lg text-sm tracking-wider hover:opacity-90 transition-opacity"
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  )
}
