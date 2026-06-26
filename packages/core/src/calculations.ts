import type { Asset } from './types'

export function calcSweatHours(
  loss: number,
  monthlyPay: number,
  hoursPerMonth: number
): { hours: number; days: number; hourlyRate: number } {
  const hourlyRate = monthlyPay / hoursPerMonth
  const hours = loss / hourlyRate
  const days = hours / 8
  return { hours, days, hourlyRate }
}

export function calcAssets(
  loss: number,
  assets: Asset[]
): Array<{ name: string; cost: number; units: number }> {
  return assets
    .filter(a => a.name && a.cost > 0)
    .map(a => ({ name: a.name, cost: a.cost, units: loss / a.cost }))
}

export function getNearMissReframe(input: string): string {
  return `⛔ ERROR: Near-miss detected.\n\n"${input}"\n\nThis is NOT a sign you are close to winning. This is a designed psychological trap. A near-miss produces the same neurochemical response as a real win — which is exactly why it was engineered this way.\n\nYou did not almost win. You lost. The outcome was a 100% financial loss. The sensation you are feeling is manufactured. If you gamble again right now, you will lose again. The house does not almost take your money — it takes your money.\n\nClose this and do not place another bet.`
}

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${(hours * 60).toFixed(0)} minutes`
  return `${hours.toFixed(1)} hours`
}
