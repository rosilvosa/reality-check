import type { Settings, StreakData } from '../types'
import { getAdapter, mergeStreak } from './storage'

const APP_ID = 'reality-check'
const VERSION = 1

export interface BackupFile {
  app: string
  version: number
  exportedAt: string
  settings: Settings | null
  journal: Array<{ amount: number; text: string; createdAt: string }>
  streak: StreakData | null
  barriers: string[]
}

type CloudUser = { uid: string; isAnonymous: boolean } | null

/** Reads through the same adapter the app uses, so this works signed in or out. */
export async function buildBackup(user: CloudUser): Promise<BackupFile> {
  const a = getAdapter(user)
  const [settings, journal, streak, barriers] = await Promise.all([
    a.getSettings(),
    a.getJournalEntries(),
    a.getStreak(),
    a.getBarriers(),
  ])

  return {
    app: APP_ID,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    journal: journal.map((e) => ({
      amount: e.amount,
      text: e.text,
      createdAt: e.createdAt.toISOString(),
    })),
    streak,
    barriers,
  }
}

export function downloadBackup(file: BackupFile): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reality-check-backup-${file.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function parseBackup(raw: string): BackupFile {
  const d = JSON.parse(raw)
  if (d?.app !== APP_ID) throw new Error('not-a-backup')
  if (typeof d.version !== 'number' || d.version > VERSION) throw new Error('unsupported-version')

  return {
    app: APP_ID,
    version: d.version,
    exportedAt: String(d.exportedAt ?? ''),
    settings: d.settings ?? null,
    journal: Array.isArray(d.journal) ? d.journal : [],
    streak: d.streak ?? null,
    barriers: Array.isArray(d.barriers) ? d.barriers : [],
  }
}

/**
 * Additive on purpose. Restoring never deletes what is already on the device:
 * settings are replaced, the streak takes the better of the two, barriers union,
 * and journal entries are appended unless an identical one is already there.
 * Someone restoring an old file should not lose the entries they wrote since.
 */
export async function restoreBackup(user: CloudUser, file: BackupFile): Promise<{ added: number }> {
  const a = getAdapter(user)

  if (file.settings) await a.saveSettings(file.settings)

  if (file.streak) {
    const current = await a.getStreak()
    await a.saveStreak(current ? mergeStreak(current, file.streak) : file.streak)
  }

  if (file.barriers.length) {
    const current = await a.getBarriers()
    await a.saveBarriers([...new Set([...current, ...file.barriers])])
  }

  let added = 0
  if (file.journal.length) {
    const current = await a.getJournalEntries()
    // Oldest first, so the restored order matches the original.
    for (const e of [...file.journal].reverse()) {
      const dup = current.some(
        (c) => c.text === e.text && Math.abs((c.amount ?? 0) - (e.amount ?? 0)) < 0.01,
      )
      if (dup) continue
      await a.addJournalEntry({
        amount: Number(e.amount) || 0,
        text: String(e.text ?? ''),
        createdAt: new Date(e.createdAt),
      })
      added++
    }
  }

  return { added }
}