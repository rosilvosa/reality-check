import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { formatMoney, MILESTONES, MILESTONE_EMOJI, localISODate, tpl, visibleStreak } from '@rc/core'
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

  useEffect(() => watchRoomStats(setRoom), [])
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

      {(roomToday > 0 || roomPesos > 0) && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
          {roomToday > 0 && (
            <p className="text-ink font-bold text-[0.9375rem] leading-snug">
              {tpl(t.home.togetherToday, { n: String(roomToday) })}
            </p>
          )}
          {roomPesos > 0 && (
            <p className={`text-ink font-bold text-[0.9375rem] leading-snug ${roomToday > 0 ? 'mt-2' : ''}`}>
              {tpl(t.home.togetherWeek, { amount: formatMoney(roomPesos, 'PHP') })}
            </p>
          )}
          <p className="text-muted text-xs mt-2">{t.home.togetherHint}</p>
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
          side by side rather than two more rows in a stack. Left neutral --
          nothing here asked for a fourth color, and not every row needs one. */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link
          to="/help"
          className="block bg-surface border border-border rounded-2xl p-4 hover:border-accent transition-colors"
        >
          <p className="text-ink font-black text-base leading-tight">{t.home.helpBtn}</p>
          <p className="text-muted text-xs mt-1 leading-snug">{t.home.helpHint}</p>
        </Link>
        <Link
          to="/community"
          className="block bg-surface border border-border rounded-2xl p-4 hover:border-accent transition-colors"
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
