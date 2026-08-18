export type VideoTopic = 'psychology' | 'recovery'

export interface RecoveryVideo {
  /**
   * The video's own title, minus any channel or speaker suffix that would just
   * repeat `source`. Not translated: it is what the video is actually called.
   */
  title: string
  /** Speaker or channel, so the viewer knows who is talking before they click. */
  source: string
  /** Omitted where we could not confirm the real runtime. */
  minutes?: number
  topic: VideoTopic
  /** YouTube id. Stored on its own so the player and the fallback link agree. */
  youtubeId: string
}

/** Fallback for when a video's owner has disabled embedding. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

/**
 * nocookie host, because the app promises not to hand people to trackers it
 * did not warn them about. `rel=0` keeps the end-of-video suggestions inside
 * the same channel, which matters more here than usual: the last thing this
 * audience needs is a recommendation rail after a talk about gambling.
 */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&autoplay=1`
}

/**
 * Curated by hand, because a dead or bait link in a recovery app costs more
 * than having no list at all. Every id here was checked against YouTube's
 * oEmbed endpoint, which is also where the channel names came from, so none of
 * these are reuploads of someone else's talk.
 *
 * All of it is in English at the moment. The page says so, since the app
 * itself speaks five languages and it would be unfair to send someone to a
 * wall of English without warning.
 *
 * The Watch page hides a group while it is empty, and the nav tab is always
 * there, so keep at least one entry per topic.
 */
export const RECOVERY_VIDEOS: RecoveryVideo[] = [
  {
    title: 'Slot Machines: Addiction by Design',
    source: 'TVO Today',
    topic: 'psychology',
    youtubeId: 'ETB0x2UU6JE',
  },
  {
    title: 'How Anticipation Primes the Brain for Problem Gambling',
    source: 'Carolyn Hawley, TEDx',
    topic: 'psychology',
    youtubeId: 't6ZLd0IfXPE',
  },
  {
    // The long one. Kept last in this group for that reason.
    title: 'Addiction by Design: From Slot Machines to Internet Gambling',
    source: 'Natasha Dow Schull, MIT (full lecture)',
    topic: 'psychology',
    youtubeId: 'GUeTnQeIFCE',
  },
  {
    title: 'The fall and rise of a gambling addict',
    source: 'Justyn Rees Larcombe, TEDx',
    topic: 'recovery',
    youtubeId: '7AN3VLLlkdI',
  },
  {
    title: 'The Silent Addiction',
    source: 'Patrick Chester, TEDx',
    topic: 'recovery',
    youtubeId: 'QSi1zbLbXAs',
  },
]
