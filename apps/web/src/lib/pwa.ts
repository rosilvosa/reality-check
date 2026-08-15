export const ONBOARDED_KEY = 'rc_onboarded_v2'
export const ONBOARDED_EVENT = 'rc-onboarded'

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboarded(): void {
  localStorage.setItem(ONBOARDED_KEY, '1')
  window.dispatchEvent(new Event(ONBOARDED_EVENT))
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || ''
  return /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger|Instagram|Line\/|TikTok|musical_ly|Bytedance|WhatsApp|Viber|Twitter|LinkedInApp|Snapchat|Pinterest|MicroMessenger/i.test(ua)
}

export function openInSystemBrowser(): void {
  const { host, pathname, search, hash, href, protocol } = window.location
  if (protocol !== 'https:' && protocol !== 'http:') return
  const path = `${pathname}${search}${hash}`
  const ua = navigator.userAgent || ''

  if (/android/i.test(ua)) {
    window.location.href = `intent://${host}${path}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(href)};end`
    return
  }

  if (/iphone|ipad|ipod/i.test(ua)) {
    window.location.href = `x-safari-${protocol}//${host}${path}`
  }
}
