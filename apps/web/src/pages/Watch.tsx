import { useEffect, useState } from 'react'
import { useT, useLang } from '../i18n'
import { RECOVERY_VIDEOS, tpl, type RecoveryVideo, type VideoTopic } from '@rc/core'
import VideoModal from '../components/VideoModal'
import { useContactStore } from '../stores/contactStore'
import { useAuthStore } from '../stores/authStore'
import {
  fetchVideoStats,
  loadLocalVideoHearts,
  recordVideoView,
  saveLocalVideoHearts,
  toggleVideoHeart,
  type VideoStats,
} from '../lib/videoStats'

const TOPIC_ORDER: VideoTopic[] = ['recovery', 'psychology']

/**
 * Stable sort: a video in the viewer's own language moves to the front of its
 * topic group, everything else keeps its original order. Nothing is ever
 * hidden by language -- the library is six videos, and hiding any of them
 * over a language mismatch would lose more than it protects, especially for
 * the psychology group where the language of the video barely matters to
 * whether the ideas apply.
 */
function sortByLang(videos: RecoveryVideo[], lang: string): RecoveryVideo[] {
  return videos
    .map((v, i) => ({ v, i }))
    .sort((a, b) => {
      const aMatch = a.v.lang === lang ? 0 : 1
      const bMatch = b.v.lang === lang ? 0 : 1
      return aMatch - bMatch || a.i - b.i
    })
    .map((x) => x.v)
}

export default function Watch() {
  const t = useT()
  const { lang } = useLang()
  const [playing, setPlaying] = useState<RecoveryVideo | null>(null)
  const suggest = useContactStore((s) => s.show)
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<Record<string, VideoStats>>({})
  const [hearted, setHearted] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchVideoStats().then(setStats).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (user) setHearted(loadLocalVideoHearts(user.uid))
  }, [user?.uid])

  function play(v: RecoveryVideo) {
    setPlaying(v)
    if (!user) return
    recordVideoView(v.youtubeId, user.uid)
      .then(() => setStats((prev) => {
        // Optimistic, and harmless if it races the real count: the Cloud
        // Function only increments once per viewer regardless of how many
        // times this fires, so the display cannot drift upward forever.
        const cur = prev[v.youtubeId] ?? { views: 0, hearts: 0 }
        return { ...prev, [v.youtubeId]: { ...cur, views: cur.views + 1 } }
      }))
      .catch(() => undefined)
  }

  function toggleHeartFor(v: RecoveryVideo) {
    if (!user) return
    const on = !hearted.has(v.youtubeId)
    const next = new Set(hearted)
    if (on) next.add(v.youtubeId); else next.delete(v.youtubeId)
    setHearted(next)
    saveLocalVideoHearts(user.uid, next)
    setStats((prev) => {
      const cur = prev[v.youtubeId] ?? { views: 0, hearts: 0 }
      return { ...prev, [v.youtubeId]: { ...cur, hearts: Math.max(0, cur.hearts + (on ? 1 : -1)) } }
    })
    toggleVideoHeart(v.youtubeId, user.uid, on).catch(() => undefined)
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.watch.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.watch.subtitle}</p>
      <p className="text-xs text-muted mb-5">{t.watch.langNote}</p>

      {TOPIC_ORDER.map((topic) => {
        const inTopic = sortByLang(RECOVERY_VIDEOS.filter((v) => v.topic === topic), lang)
        if (inTopic.length === 0) return null
        return (
          <div key={topic} className="mb-6 last:mb-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              {topic === 'psychology' ? t.watch.psychology : t.watch.recovery}
            </p>
            <div className="space-y-3">
              {inTopic.map((v) => {
                const s = stats[v.youtubeId]
                const liked = hearted.has(v.youtubeId)
                return (
                  <div
                    key={v.youtubeId}
                    className="w-full bg-surface border border-border rounded-2xl p-5 hover:border-accent transition-colors"
                  >
                    <button type="button" onClick={() => play(v)} className="w-full text-left">
                      <div className="flex items-start gap-4">
                        <span className="shrink-0 w-10 h-10 rounded-full bg-accent-dim text-accent flex items-center justify-center text-sm" aria-hidden>
                          &#9654;
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-ink font-bold text-[0.9375rem] leading-snug">{v.title}</span>
                          <span className="block text-muted text-sm mt-1">
                            {v.source}
                            {v.minutes !== undefined && (
                              <> &middot; {tpl(t.watch.minutes, { n: String(v.minutes) })}</>
                            )}
                          </span>
                        </span>
                      </div>
                    </button>
                    <div className="flex items-center justify-between mt-3 pl-14">
                      <span className="text-muted text-xs">
                        {s && s.views > 0 ? tpl(t.watch.viewsLabel, { n: String(s.views) }) : t.watch.viewsNone}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleHeartFor(v)}
                        disabled={!user}
                        aria-label={liked ? t.watch.heartedAria : t.watch.heartAria}
                        className={`text-xs font-bold shrink-0 ${liked ? 'text-ink' : 'text-muted hover:text-ink'} disabled:opacity-50`}
                      >
                        {liked ? '♥' : '♡'} {s?.hearts ?? 0}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Suggestions go to the maintainer's inbox rather than straight onto the
          page. The list stays in the repo where it can be reviewed in public,
          and a stranger cannot put an affiliate link in front of someone who is
          mid-urge. */}
      <div className="mt-6 bg-surface border border-border rounded-2xl p-5">
        <p className="text-muted text-sm leading-relaxed mb-3">{t.watch.suggestHint}</p>
        <button
          type="button"
          onClick={() => suggest('typeVideo')}
          className="text-xs font-bold text-accent border border-accent-dim px-3 py-1.5 rounded-lg hover:bg-accent-dim transition-colors"
        >
          {t.watch.suggestBtn} &rarr;
        </button>
      </div>

      <VideoModal
        video={playing}
        onClose={() => setPlaying(null)}
        views={playing ? stats[playing.youtubeId]?.views : undefined}
        hearted={playing ? hearted.has(playing.youtubeId) : false}
        heartDisabled={!user}
        onToggleHeart={() => playing && toggleHeartFor(playing)}
      />
    </div>
  )
}
