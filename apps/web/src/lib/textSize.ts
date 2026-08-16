export type TextSize = 'normal' | 'large'

const KEY = 'rc_text_size'

// Large is the default: this gets opened in distress, often one-handed, often
// on a small phone. Someone who wants it tighter can opt down.
export function readTextSize(): TextSize {
  try {
    return localStorage.getItem(KEY) === 'normal' ? 'normal' : 'large'
  } catch {
    return 'large'
  }
}

/**
 * Every size in the app is in rem, so moving the root font size scales the
 * type and the space around it together, the way browser zoom does. Setting
 * it back to '' restores the stylesheet default rather than hardcoding 16px.
 */
export function applyTextSize(size: TextSize): void {
  document.documentElement.style.fontSize = size === 'large' ? '112.5%' : ''
}

export function persistTextSize(size: TextSize): void {
  try {
    localStorage.setItem(KEY, size)
  } catch { /* ignore */ }
  applyTextSize(size)
}