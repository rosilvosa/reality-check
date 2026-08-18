import { useT } from '../i18n'
import { RECOVERY_VIDEOS, tpl, type VideoTopic } from '@rc/core'

const TOPIC_ORDER: VideoTopic[] = ['psychology', 'recovery']

export default function Watch() {
  const t = useT()

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
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-surface border border-border rounded-2xl p-5 hover:border-accent transition-colors"
                >
                  <p className="text-ink font-bold text-[0.9375rem] leading-snug">{v.title}</p>
                  <p className="text-muted text-sm mt-1">
                    {v.source}
                    {v.minutes !== undefined && (
                      <> &middot; {tpl(t.watch.minutes, { n: String(v.minutes) })}</>
                    )}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
