import { useState } from 'react'
import { useT } from '../i18n'
import { RECOVERY_VIDEOS, tpl, type RecoveryVideo, type VideoTopic } from '@rc/core'
import VideoModal from '../components/VideoModal'

const TOPIC_ORDER: VideoTopic[] = ['psychology', 'recovery']

export default function Watch() {
  const t = useT()
  const [playing, setPlaying] = useState<RecoveryVideo | null>(null)

  return (
    <div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.watch.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.watch.subtitle}</p>
      <p className="text-xs text-muted mb-5">{t.watch.langNote}</p>

      {TOPIC_ORDER.map((topic) => {
        const inTopic = RECOVERY_VIDEOS.filter((v) => v.topic === topic)
        if (inTopic.length === 0) return null
        return (
          <div key={topic} className="mb-6 last:mb-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              {topic === 'psychology' ? t.watch.psychology : t.watch.recovery}
            </p>
            <div className="space-y-3">
              {inTopic.map((v) => (
                <button
                  key={v.youtubeId}
                  type="button"
                  onClick={() => setPlaying(v)}
                  className="w-full text-left bg-surface border border-border rounded-2xl p-5 hover:border-accent transition-colors"
                >
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
              ))}
            </div>
          </div>
        )
      })}

      <VideoModal video={playing} onClose={() => setPlaying(null)} />
    </div>
  )
}
