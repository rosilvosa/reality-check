export type VideoTopic = 'psychology' | 'recovery'

export interface RecoveryVideo {
  /** Shown as-is. A video title is not ours to translate or rewrite. */
  title: string
  /** Channel or speaker, so the viewer knows who is talking before they click. */
  source: string
  minutes: number
  topic: VideoTopic
  url: string
}

/**
 * Curated by hand, because a dead or bait link in a recovery app costs more
 * than having no list at all. Every entry should be a video someone here has
 * actually watched end to end.
 *
 * The section on the "why this happens" page hides itself while this is empty,
 * so adding the first entry is all it takes to make it appear.
 */
export const RECOVERY_VIDEOS: RecoveryVideo[] = []
