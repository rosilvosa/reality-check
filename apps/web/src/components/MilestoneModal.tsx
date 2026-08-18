import { useStreakStore } from '../stores/streakStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useT } from '../i18n'
import { formatMoney, tpl, MILESTONE_EMOJI } from '@rc/core'

export default function MilestoneModal() {
  const { showMilestoneModal, newMilestone, getTotalLost, dismissMilestone } = useStreakStore()
  const { assets, currency } = useSettingsStore()
  const t = useT()

  if (!showMilestoneModal || newMilestone === null) return null

  const totalLost = getTotalLost()
  const badge = MILESTONE_EMOJI[newMilestone] ?? '🏅'
  const title = tpl(newMilestone === 1 ? t.milestone.titleOne : t.milestone.titleMany, { n: String(newMilestone) })
  const message = t.milestoneMessages[String(newMilestone)] ?? title

  const assetLines = (assets ?? [])
    .filter((a) => a.cost > 0)
    .map((a) => `${(totalLost / a.cost).toFixed(1)}× ${a.name}`)
    .slice(0, 3)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-surface border-2 border-accent rounded-2xl p-8 text-center">
        <div className="text-7xl mb-4">{badge}</div>
        <h2 className="text-3xl font-black text-ink mb-1">
          {title}
        </h2>
        {totalLost > 0 && (
          <p className="text-muted text-sm mb-3">
            {t.milestone.costBefore}{' '}
            <span className="text-ink font-bold">
              {formatMoney(totalLost, currency)}
            </span>
            {assetLines.length > 0 && (
              <> — {assetLines.join(', ')}</>
            )}
          </p>
        )}
        <p className="text-ink font-semibold text-base leading-relaxed mb-8">
          {message}
        </p>
        <button
          onClick={dismissMilestone}
          className="w-full py-3 bg-accent text-white font-black rounded-lg text-sm tracking-wider hover:opacity-90 transition-opacity"
        >
          {t.milestone.acknowledge}
        </button>
      </div>
    </div>
  )
}
