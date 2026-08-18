import type { Settings, JournalEntry, StreakData } from '../types'

const LS_SETTINGS = 'rc_settings'
const LS_JOURNAL  = 'rc_journal'
const LS_STREAK   = 'rc_streak'
const LS_BARRIERS = 'rc_barriers'

export const LOCAL_KEYS = [
  LS_SETTINGS, LS_JOURNAL, LS_STREAK, LS_BARRIERS, 'rc_onboarded', 'rc_lang',
] as const

export interface StorageAdapter {
  getSettings(): Promise<Settings | null>
  saveSettings(s: Settings): Promise<void>
  getJournalEntries(): Promise<JournalEntry[]>
  addJournalEntry(e: Omit<JournalEntry, 'id'>): Promise<JournalEntry>
  getStreak(): Promise<StreakData | null>
  saveStreak(s: StreakData): Promise<void>
  getBarriers(): Promise<string[]>
  saveBarriers(ids: string[]): Promise<void>
}

type CloudUser = { uid: string; isAnonymous: boolean } | null

export const localStorageAdapter: StorageAdapter = {
  async getSettings() {
    try {
      const raw = localStorage.getItem(LS_SETTINGS)
      if (!raw) return null
      const d = JSON.parse(raw)
      return { ...d, helpRegion: d.helpRegion ?? 'PH', currency: d.currency ?? 'PHP', updatedAt: d.updatedAt }
    } catch { return null }
  },

  async saveSettings(s) {
    localStorage.setItem(LS_SETTINGS, JSON.stringify({ ...s, updatedAt: new Date().toISOString() }))
  },

  async getJournalEntries() {
    try {
      const raw = localStorage.getItem(LS_JOURNAL)
      const arr: Array<JournalEntry & { createdAt: string | Date }> = raw ? JSON.parse(raw) : []
      return arr.map((e) => ({ ...e, createdAt: new Date(e.createdAt) }))
    } catch { return [] }
  },

  async addJournalEntry(e) {
    const existing = await localStorageAdapter.getJournalEntries()
    // Restores add many entries within the same millisecond, so Date.now()
    // alone produces duplicate ids and duplicate React keys.
    const id = `-`
    const entry: JournalEntry = { ...e, id, createdAt: e.createdAt ?? new Date() }
    const updated = [entry, ...existing]
    localStorage.setItem(
      LS_JOURNAL,
      JSON.stringify(updated.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() }))),
    )
    return entry
  },

  async getStreak() {
    try {
      const raw = localStorage.getItem(LS_STREAK)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },

  async saveStreak(s) {
    localStorage.setItem(LS_STREAK, JSON.stringify(s))
  },

  async getBarriers() {
    try {
      const raw = localStorage.getItem(LS_BARRIERS)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  },

  async saveBarriers(ids) {
    localStorage.setItem(LS_BARRIERS, JSON.stringify(ids))
  },
}

/**
 * Everything that talks to Firestore lives in ./cloud and is imported on
 * demand, so a signed-out user never downloads the Firestore SDK. That was
 * roughly 107 kB gzipped sitting in front of the first paint for people who
 * were never going to use it.
 */
const loadCloud = () => import('./cloud')

/**
 * A cloud adapter that pulls its implementation in on first use. Every method
 * on StorageAdapter already returns a promise, so this is a straight pass
 * through and no caller had to change. The dynamic import is cached by the
 * module system, so only the first call pays for it.
 */
function lazyCloudAdapter(uid: string): StorageAdapter {
  const impl = () => loadCloud().then((m) => m.firestoreAdapter(uid))
  return {
    getSettings: () => impl().then((x) => x.getSettings()),
    saveSettings: (s) => impl().then((x) => x.saveSettings(s)),
    getJournalEntries: () => impl().then((x) => x.getJournalEntries()),
    addJournalEntry: (entry) => impl().then((x) => x.addJournalEntry(entry)),
    getStreak: () => impl().then((x) => x.getStreak()),
    saveStreak: (s) => impl().then((x) => x.saveStreak(s)),
    getBarriers: () => impl().then((x) => x.getBarriers()),
    saveBarriers: (ids) => impl().then((x) => x.saveBarriers(ids)),
  }
}

export function getAdapter(user: CloudUser): StorageAdapter {
  if (user && !user.isAnonymous) return lazyCloudAdapter(user.uid)
  return localStorageAdapter
}

// Same names and signatures as before the split, so call sites are untouched.
export function migrateToFirestore(uid: string): Promise<boolean> {
  return loadCloud().then((m) => m.migrateToFirestore(uid))
}

export function syncNowToCloud(
  uid: string,
  data: { settings: Settings; streak: StreakData },
): Promise<void> {
  return loadCloud().then((m) => m.syncNowToCloud(uid, data))
}

export function deleteUserCloudData(uid: string): Promise<void> {
  return loadCloud().then((m) => m.deleteUserCloudData(uid))
}

/**
 * Barriers, read synchronously. The async adapter resolves a microtask later,
 * which is long enough to paint an empty checklist first and then snap to the
 * real one. Signed-out users can skip that flash entirely.
 */
export function readLocalBarriersSync(): string[] {
  try {
    const raw = localStorage.getItem(LS_BARRIERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Streak, read synchronously, same reasoning as readLocalBarriersSync above:
 * the async adapter resolves a beat later than first paint, which was long
 * enough for the days-clean banner to render a loading skeleton, then swap to
 * the real checked-in-or-not layout a moment later -- a structural change
 * (Link vs plain div, a button row present or not), not just a content
 * update, so it read as a twitch rather than a load. Seeding from this local
 * snapshot means the correct final shape is what paints first, for anyone
 * who has ever opened the app on this device before.
 *
 * For a signed-in user this snapshot can be briefly stale (another device
 * moved the streak further since this one last synced); loadStreak still
 * runs afterward and corrects it via mergeStreak. A content correction is
 * far less jarring than a shape correction, and the barriers precedent above
 * already accepts that same trade for signed-in users on a fresh device.
 */
export function readLocalStreakSync(): StreakData | null {
  try {
    const raw = localStorage.getItem(LS_STREAK)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearLocalRc(): void {
  for (const key of LOCAL_KEYS) localStorage.removeItem(key)
}

export function mergeStreak(a: StreakData, b: StreakData): StreakData {
  const aDate = a.lastCheckInDate ?? ''
  const bDate = b.lastCheckInDate ?? ''
  // Whichever side checked in most recently is the live one, and its streak is
  // taken whole. Taking max(currentStreak) while taking the later date could
  // show a clean streak the user never earned -- the one lie this app must not
  // tell. longestStreak is a genuine historical best, so max is right there.
  const live = bDate > aDate ? b : a
  return {
    currentStreak: live.currentStreak,
    longestStreak: Math.max(a.longestStreak, b.longestStreak),
    lastCheckInDate: live.lastCheckInDate,
    milestonesSeen: [...new Set([...(a.milestonesSeen ?? []), ...(b.milestonesSeen ?? [])])],
    startDate: a.startDate && b.startDate
      ? (a.startDate < b.startDate ? a.startDate : b.startDate)
      : (a.startDate ?? b.startDate),
  }
}

