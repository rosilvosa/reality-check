/**
 * A separate map of the exact same dynamic import() calls App.tsx wraps in
 * lazy(). Calling one of these on touch/press-down -- before the tap has
 * even finished registering as a click -- starts the network fetch for that
 * route's chunk early, so by the time navigation actually happens the
 * import is already in flight or resolved from the browser's module cache.
 * lazy()'s own import() call later hits that same cache and resolves
 * instantly instead of re-fetching, since it is the same specifier string
 * and Vite chunks by that, not by which file called it.
 *
 * A separate map rather than exporting the same functions from App.tsx:
 * Layout.tsx cannot import from App.tsx without a circular import (App
 * renders Layout via the router), so this lives on its own instead.
 */
export const ROUTE_PRELOAD: Record<string, () => Promise<unknown>> = {
  '/lost': () => import('../pages/Lost'),
  '/journal': () => import('../pages/Journal'),
  '/trap': () => import('../pages/Trap'),
  '/trap/why': () => import('../pages/TrapWhy'),
  '/barriers': () => import('../pages/Barriers'),
  '/settings': () => import('../pages/Settings'),
  '/progress': () => import('../pages/Progress'),
  '/community': () => import('../pages/Community'),
  '/help': () => import('../pages/FindHelp'),
  '/watch': () => import('../pages/Watch'),
}

const preloaded = new Set<string>()

/** Fire-and-forget; a failed preload is not an error, the real navigation's
 * own lazy() import will just try again and surface any real failure there. */
export function preloadRoute(to: string): void {
  if (preloaded.has(to)) return
  const load = ROUTE_PRELOAD[to]
  if (!load) return
  preloaded.add(to)
  load().catch(() => undefined)
}
