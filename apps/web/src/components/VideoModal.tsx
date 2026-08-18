import { useEffect } from 'react'
import { tpl, youtubeEmbedUrl, youtubeWatchUrl, type RecoveryVideo } from '@rc/core'
import { useT } from '../i18n'

interface Props {
  video: RecoveryVideo | null
  onClose: () => void
  /** Undefined while stats are still loading, or if the video has no views yet. */
  views?: number
  hearted: boolean
  /** Disabled while signed out entirely -- same rule as the card in Watch. */
  heartDisabled: boolean
  onToggleHeart: () => void
}

export default function VideoModal({
  video, onClose, views, hearted, heartDisabled, onToggleHeart,
}: Props) {
  useEffect(() => {
    if (!video) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [video, onClose])

  const t = useT()
  // Unmounting rather than hiding, so closing actually stops the audio.
  if (!video) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
    >
      <button
        type="button"
        aria-label={t.common.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-2xl bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="aspect-video bg-black">
          <iframe
            key={video.youtubeId}
            src={youtubeEmbedUrl(video.youtubeId)}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <div className="p-5">
          <h2 id="video-title" className="text-ink font-bold text-[0.9375rem] leading-snug">
            {video.title}
          </h2>
          <p className="text-muted text-sm mt-1">{video.source}</p>

          {/* Same row as the card on Watch, so leaving the modal open to
              react to a video does not require closing it first. */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-muted text-xs">
              {views !== undefined && views > 0 ? tpl(t.watch.viewsLabel, { n: String(views) }) : t.watch.viewsNone}
            </span>
            <button
              type="button"
              onClick={onToggleHeart}
              disabled={heartDisabled}
              aria-label={hearted ? t.watch.heartedAria : t.watch.heartAria}
              className={`text-xs font-bold shrink-0 ${hearted ? 'text-ink' : 'text-muted hover:text-ink'} disabled:opacity-50`}
            >
              {hearted ? '♥' : '♡'}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-muted hover:text-ink"
            >
              {t.common.close}
            </button>
            {/* Some owners disable embedding, and there is no reliable way to
                detect it from here, so the way out is always on screen. */}
            <a
              href={youtubeWatchUrl(video.youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 border border-accent-dim rounded-lg text-sm font-bold text-accent text-center hover:bg-accent-dim transition-colors"
            >
              {t.watch.openOnYouTube}
            </a>
          </div>

          <p className="text-muted text-[0.6875rem] mt-3 leading-relaxed">{t.watch.playNote}</p>
        </div>
      </div>
    </div>
  )
}
