import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { formatMoney, MILESTONES, MILESTONE_EMOJI, localISODate, tpl, visibleStreak } from '@rc/core'
import { useStreakStore } from '../stores/streakStore'
import { useJournalStore } from '../stores/journalStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useRoomStore } from '../stores/roomStore'
import InstallHint from '../components/InstallHint'
import { todayCheckIns, todayHonestyCount } from '../lib/room'

function isCheckedInToday(lastCheckInDate: string | null): boolean {
  if (!lastCheckInDate) return false
  return lastCheckInDate === localISODate()
}

export default function Home() {
  const t = useT()
  const { currentStreak, lastCheckInDate, loading, checkIn, lostToday } = useStreakStore()
  const entries = useJournalStore((s) => s.entries)
  const currency = useSettingsStore((s) => s.currency) ?? 'PHP'
  const checkedIn = isCheckedInToday(lastCheckInDate)
  const lostTodayFlag = lostToday()
  const latest = entries[0]
  const days = visibleStreak(currentStreak, lastCheckInDate)
  const earned = [...MILESTONES].reverse().find((m) => days >= m)
  const badge = earned ? MILESTONE_EMOJI[earned] : null
  const nextMilestone = MILESTONES.find((m) => m > days)
  // Lives in a store (see roomStore.ts), not local state -- the subscription
  // is set up once for the whole session, so returning to Home after
  // visiting another tab shows the already-known numbers immediately instead
  // of resetting to a loading skeleton every time.
  const { room, roomLoaded } = useRoomStore()
  const roomToday = todayCheckIns(room)
  const roomHonesty = todayHonestyCount(room)

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-extrabold text-ink mb-1">Reality Check</h1>
          <p className="text-sm text-muted leading-relaxed">{t.home.subtitle}</p>
        </div>
        {/* Moved up from its own card below -- see docs/specs for why the
            second line counts disclosures, not pesos. No skeleton here either,
            same reasoning as before: it only has a load gap once per tab
            session now, so it just appears once resolved. */}
        {roomLoaded && (roomToday > 0 || roomHonesty > 0) && (
          <div className="text-right shrink-0 pt-0.5">
            {roomToday > 0 && (
              <div className="leading-tight">
                <span className="text-ink font-black text-sm tabular-nums">{roomToday}</span>
                <span className="text-muted text-[0.625rem] font-semibold uppercase tracking-wide ml-1">
                  {t.home.checkedInLabel}
                </span>
              </div>
            )}
            {roomHonesty > 0 && (
              <div className="leading-tight mt-0.5">
                <span className="text-ink font-black text-sm tabular-nums">{roomHonesty}</span>
                <span className="text-muted text-[0.625rem] font-semibold uppercase tracking-wide ml-1">
                  {t.home.honestyLabel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <InstallHint />

      <p className="text-[0.6875rem] tracking-[0.18em] uppercase text-muted mb-1">{t.home.tag}</p>

      {/* The count itself: badge, number, "DAYS CLEAN" label, and the
          zero-day start hint. Shared between the checked-in and
          not-checked-in renders below so there is one copy of this markup,
          not two drifting in step. */}
      {(() => {
        const countBlock = (
          <div>
            <div className="flex items-end gap-3">
              {badge && (
                <span className="text-4xl leading-none" aria-hidden>
                  {badge}
                </span>
              )}
              <div className={`text-5xl font-black leading-none ${loading ? 'text-muted' : 'text-ink'}`}>
                {loading ? '—' : days}
              </div>
            </div>
            <div className="text-muted text-xs font-semibold uppercase tracking-wider mt-1">{t.home.daysLabel}</div>
            {!loading && days === 0 && (
              <p className="text-ink text-sm mt-3">{t.home.startHint}</p>
            )}
          </div>
        )

        // Checked in: the whole banner goes to Progress, not just a corner of
        // it. No button lives in this state, so there is nothing an outer
        // link would swallow clicks from.
        if (!loading && checkedIn) {
          return (
            <Link
              to="/progress"
              className="block bg-surface border border-border rounded-2xl p-5 mb-4 hover:border-accent transition-colors"
            >
              <div className="flex items-end justify-between gap-4">
                {countBlock}
                <div className="text-right shrink-0">
                  <span className="block text-sm font-black tracking-wide text-ink">{t.home.checkedIn}</span>
                  <span className="block text-xs font-bold text-muted mt-0.5">{t.home.seeProgress} →</span>
                </div>
              </div>
              {/* Same goal bar as Progress -- reusing its copy and math
                  rather than inventing Home-specific wording, so "6 days to
                  your 14-day mark" means the same thing and uses the same
                  translated strings in both places. Home's version is
                  slimmer to fit the tighter card. */}
              {!loading && nextMilestone !== undefined && (
                <div className="mt-3">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-muted text-[0.6875rem] font-bold">
                      {nextMilestone - days === 1
                        ? tpl(t.progress.nextGoalOne, { d: String(nextMilestone) })
                        : tpl(t.progress.nextGoal, { n: String(nextMilestone - days), d: String(nextMilestone) })}
                    </span>
                    <span className="text-muted text-[0.6875rem] font-bold tabular-nums shrink-0">
                      {days} / {nextMilestone}
                    </span>
                  </div>
                  <div className="w-full bg-surface2 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${(days / nextMilestone) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          )
        }

        // Loading, lost-today, or not yet checked in: a button or a status
        // message shares the card, so it stays a plain div and only the
        // small corner link goes to Progress.
        return (
          <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
            <div className="flex items-end justify-between gap-4 mb-4">
              {countBlock}
              {/* A same-position skeleton here, not nothing, is what stops the
                  checked-in corner text from popping in from blank space the
                  instant loading resolves -- it was appearing at the same
                  moment the button row below vanished, and the two at once is
                  what read as a twitch rather than a load. */}
              {loading && (
                <div className="text-right shrink-0 animate-pulse" aria-hidden="true">
                  <div className="h-3.5 w-24 bg-surface2 rounded mb-1.5 ml-auto" />
                  <div className="h-3 w-16 bg-surface2 rounded ml-auto" />
                </div>
              )}
              {!loading && (
                <Link to="/progress" className="text-xs font-bold text-muted hover:text-ink shrink-0">
                  {t.home.seeProgress} →
                </Link>
              )}
            </div>
              {/* Same goal bar as Progress -- reusing its copy and math
                  rather than inventing Home-specific wording, so "6 days to
                  your 14-day mark" means the same thing and uses the same
                  translated strings in both places. Home's version is
                  slimmer to fit the tighter card. */}
              {!loading && nextMilestone !== undefined && (
                <div className="mt-3">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-muted text-[0.6875rem] font-bold">
                      {nextMilestone - days === 1
                        ? tpl(t.progress.nextGoalOne, { d: String(nextMilestone) })
                        : tpl(t.progress.nextGoal, { n: String(nextMilestone - days), d: String(nextMilestone) })}
                    </span>
                    <span className="text-muted text-[0.6875rem] font-bold tabular-nums shrink-0">
                      {days} / {nextMilestone}
                    </span>
                  </div>
                  <div className="w-full bg-surface2 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${(days / nextMilestone) * 100}%` }}
                    />
                  </div>
                </div>
              )}

            {loading && (
              <div className="w-full py-3.5 bg-surface2 text-muted font-black rounded-xl text-sm text-center tracking-wide">
                —
              </div>
            )}
            {!loading && (
              lostTodayFlag ? (
                // No check-in offered on a day with a loss written down. A
                // disabled button with no reason reads as a broken app, so
                // say why instead.
                <p className="w-full py-3.5 px-4 bg-surface2 rounded-xl text-center text-xs font-bold text-muted leading-relaxed">
                  {t.home.lostToday}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={checkIn}
                  className="w-full py-3.5 bg-accent text-white font-black rounded-xl text-sm tracking-wide hover:opacity-90"
                >
                  {t.home.checkInNow}
                </button>
              )
            )}
          </div>
        )
      })()}

      {/* Lost and Why paired into one row: they are the two most-reached-for
          links, and each gets its own color so the row reads as two distinct
          doors rather than a continuation of the neutral list below. Red for
          the thing that just happened, amber for the explanation of why. */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link
          to="/lost"
          className="block bg-accent-dim border border-accent rounded-2xl p-4 hover:opacity-90 transition-opacity"
        >
          <p className="text-ink font-black text-base leading-tight">{t.home.lostBtn}</p>
          <p className="text-muted text-xs mt-1 leading-snug">{t.home.lostHint}</p>
        </Link>
        <Link
          to="/trap/why"
          className="block bg-amber-dim border border-amber rounded-2xl p-4 hover:opacity-90 transition-opacity"
        >
          <p className="text-ink font-black text-base leading-tight">{t.home.whyBtn}</p>
          <p className="text-muted text-xs mt-1 leading-snug">{t.home.whyHint}</p>
        </Link>
      </div>

      <Link
        to="/journal"
        className="block bg-calm-dim border border-calm rounded-2xl p-5 mb-3 hover:opacity-90 transition-opacity"
      >
        <p className="text-ink font-black text-lg">{t.home.writeBtn}</p>
        <p className="text-muted text-sm mt-1">{t.home.writeHint}</p>
      </Link>

      {/* Help and Community paired the same way Lost and Why were: two doors
          side by side rather than two more rows in a stack. Same color for
          both, since they are the same kind of door (people and support),
          unlike Lost/Why which are deliberately two different colors for two
          different things. */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link
          to="/help"
          className="block bg-support-dim border border-support rounded-2xl p-4 hover:opacity-90 transition-opacity"
        >
          <p className="text-ink font-black text-base leading-tight">{t.home.helpBtn}</p>
          <p className="text-muted text-xs mt-1 leading-snug">{t.home.helpHint}</p>
        </Link>
        <Link
          to="/community"
          className="block bg-support-dim border border-support rounded-2xl p-4 hover:opacity-90 transition-opacity"
        >
          <p className="text-ink font-black text-base leading-tight">{t.home.communityBtn}</p>
          <p className="text-muted text-xs mt-1 leading-snug">{t.home.communityHint}</p>
        </Link>
      </div>

      {latest && (
        <Link to="/journal" className="block bg-surface border border-border rounded-2xl p-5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-muted mb-2">{t.home.lastEntry}</p>
          {latest.amount > 0 && (
            <p className="text-xs text-muted mb-1">{formatMoney(latest.amount, currency)}</p>
          )}
          <p className="text-ink text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{latest.text}</p>
        </Link>
      )}
    </div>
  )
}
