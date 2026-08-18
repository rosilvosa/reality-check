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
  url: string
}

/**
 * Curated by hand, because a dead or bait link in a recovery app costs more
 * than having no list at all. Every URL here was checked against YouTube's
 * oEmbed endpoint, which is also where the channel names came from, so none of
 * these are reuploads of someone else's talk.
 *
 * All of it is in English at the moment. The hint on the page says so, since
 * the app itself speaks five languages and it would be unfair to send someone
 * to a wall of English without warning.
 *
 * The section on the "why this happens" page hides itself while this is empty.
 */
export const RECOVERY_VIDEOS: RecoveryVideo[] = [
  {
    title: 'Slot Machines: Addiction by Design',
    source: 'TVO Today',
    topic: 'psychology',
    url: 'https://www.youtube.com/watch?v=ETB0x2UU6JE',
  },
  {
    title: 'How Anticipation Primes the Brain for Problem Gambling',
    source: 'Carolyn Hawley, TEDx',
    topic: 'psychology',
    url: 'https://www.youtube.com/watch?v=t6ZLd0IfXPE',
  },
  {
    // The long one. Kept last in this group for that reason.
    title: 'Addiction by Design: From Slot Machines to Internet Gambling',
    source: 'Natasha Dow Schull, MIT (full lecture)',
    topic: 'psychology',
    url: 'https://www.youtube.com/watch?v=GUeTnQeIFCE',
  },
  {
    title: 'The fall and rise of a gambling addict',
    source: 'Justyn Rees Larcombe, TEDx',
    topic: 'recovery',
    url: 'https://www.youtube.com/watch?v=7AN3VLLlkdI',
  },
  {
    title: 'The Silent Addiction',
    source: 'Patrick Chester, TEDx',
    topic: 'recovery',
    url: 'https://www.youtube.com/watch?v=QSi1zbLbXAs',
  },
]
