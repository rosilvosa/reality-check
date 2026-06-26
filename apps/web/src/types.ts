export interface Asset {
  name: string
  cost: number
}

export interface Settings {
  monthlyPay: number
  hoursPerMonth: number
  assets: Asset[]
}

export interface JournalEntry {
  id: string
  amount: number
  text: string
  createdAt: Date
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string | null
  milestonesSeen: number[]
  startDate: string | null
}
