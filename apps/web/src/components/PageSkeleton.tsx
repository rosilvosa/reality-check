/**
 * Route-switch placeholder, not a per-page mimic. Building an exact skeleton
 * for every lazy route would mean maintaining fifteen-plus bespoke layouts in
 * lockstep with real content that keeps changing. This instead follows the
 * one rhythm nearly every page here actually has -- a title, a one-line
 * subtitle, then a stack of rounded cards -- which is enough to stop a tab
 * switch from going blank while its chunk loads.
 */
export default function PageSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-5 w-36 bg-surface2 rounded mb-2" />
      <div className="h-4 w-full max-w-xs bg-surface2 rounded mb-6" />
      <div className="space-y-3">
        <div className="h-24 bg-surface2 rounded-2xl" />
        <div className="h-24 bg-surface2 rounded-2xl" />
        <div className="h-16 bg-surface2 rounded-2xl" />
      </div>
    </div>
  )
}
