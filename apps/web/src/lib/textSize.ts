export type TextSize = 'normal' | 'large'

const KEY = 'rc_text_size'

export function readTextSize(): TextSize {
  try {
    return localStorage.getItem(KEY) === 'large' ? 'large' : 'normal'
  } catch {
    return 'normal'
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