import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { formatMoney, MILESTONES, MILESTONE_EMOJI, localISODate, visibleStreak } from '@rc/core'
import { useStreakStore } from '../stores/streakStore'
import { useJournalStore } from '../stores/journalStore'
import { useSettingsStore } from '../stores/settingsStore'
import InstallHint from '../components/InstallHint'
import { todayCheckIns, watchRoomStats, weekPesos, type RoomStats } from '../lib/room'

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
  const [room, setRoom] = useState<RoomStats | null>(null)
  // Distinct from room itself: room stays null both before the first
  // snapshot arrives and when there is genuinely nothing to show, and those
  // two cases need different treatment below.
  const [roomLoaded, setRoomLoaded] = useState(false)

  useEffect(() => watchRoomStats((r) => { setRoom(r); setRoomLoaded(true) }), [])
  const roomToday = todayCheckIns(room)
  const roomPesos = weekPesos(room)

  return (
    <div>
      <h1 className="text-lg font-extrabold text-ink mb-1">Reality Check</h1>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.home.subtitle}</p>

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

      {/* Two columns when both numbers exist, one full-width tile when only
          one does -- a forced 2-col grid with an empty/zero second slot would
          look broken rather than just quiet. Layout-only change: the pesos
          figure is a placeholder for an honest-disclosure count, spec'd
          separately rather than built here (see docs/specs).

          Room data now loads from a lazy chunk plus a Firestore round-trip
          (see #4), so it used to arrive late enough that Lost/Why appeared
          first and this card popped in above them a beat later, shoving both
          down. Reserving the same footprint with a skeleton while
          !roomLoaded keeps that from happening; the skeleton collapses away
          instead if the answer turns out to be nothing to show. */}
      {!roomLoaded && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-4 animate-pulse" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-7 w-10 bg-surface2 rounded mb-2" />
              <div className="h-3 w-20 bg-surface2 rounded" />
            </div>
            <div>
              <div className="h-7 w-16 bg-surface2 rounded mb-2" />
              <div className="h-3 w-24 bg-surface2 rounded" />
            </div>
          </div>
        </div>
      )}
      {roomLoaded && (roomToday > 0 || roomPesos > 0) && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
          <div className={`grid gap-4 ${roomToday > 0 && roomPesos > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {roomToday > 0 && (
              <div>
                <div className="text-2xl font-black text-ink leading-none">{roomToday}</div>
                <div className="text-muted text-[0.6875rem] font-semibold uppercase tracking-wider mt-1.5">
                  {t.home.checkedInLabel}
                </div>
              </div>
            )}
            {roomPesos > 0 && (
              <div>
                <div className="text-2xl font-black text-ink leading-none">{formatMoney(roomPesos, 'PHP')}</div>
                <div className="text-muted text-[0.6875rem] font-semibold uppercase tracking-wider mt-1.5">
                  {t.home.lostWeekLabel}
                </div>
              </div>
            )}
          </div>
          <p className="text-muted text-xs mt-3">{t.home.togetherHint}</p>
        </div>
      )}

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
