import { useState } from 'react'
import { createCheckoutSession } from '../lib/paymongo'

interface Props {
  isOpen: boolean
  onClose: () => void
  onNeedAuth: () => void
  isSignedIn: boolean
}

export default function UpgradeModal({ isOpen, onClose, onNeedAuth, isSignedIn }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleUpgrade() {
    if (!isSignedIn) {
      onClose()
      onNeedAuth()
      return
    }
    setError('')
    setLoading(true)
    try {
      const url = await createCheckoutSession()
      window.location.href = url
    } catch (e: any) {
      setError(e.message ?? 'Payment failed to start')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-white mb-1">Sync Your Recovery Data</h2>
        <p className="text-sm text-muted mb-5">
          Your journal entries are the most important part of this tool. Keep them safe and accessible on every device.
        </p>

        {/* Comparison table */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Free */}
          <div className="bg-surface2 border border-border rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Free</div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-muted">✓</span><span className="text-white">All features</span></li>
              <li className="flex gap-2"><span className="text-muted">✓</span><span className="text-white">Unlimited entries</span></li>
              <li className="flex gap-2"><span className="text-muted">✗</span><span className="text-muted">This device only</span></li>
              <li className="flex gap-2"><span className="text-muted">✗</span><span className="text-muted">No backup</span></li>
            </ul>
            <div className="mt-4 text-lg font-bold text-muted">₱0</div>
          </div>

          {/* Pro */}
          <div className="bg-surface2 border-2 border-accent rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Pro</div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-accent">✓</span><span className="text-white">All features</span></li>
              <li className="flex gap-2"><span className="text-accent">✓</span><span className="text-white">Unlimited entries</span></li>
              <li className="flex gap-2"><span className="text-accent">✓</span><span className="text-white">All your devices</span></li>
              <li className="flex gap-2"><span className="text-accent">✓</span><span className="text-white">Cloud backup</span></li>
            </ul>
            <div className="mt-4 text-lg font-bold text-white">₱299 <span className="text-sm font-normal text-muted">once</span></div>
          </div>
        </div>

        <p className="text-xs text-muted mb-4 text-center">
          Pay once. No subscription. GCash, Maya, and cards accepted.
        </p>

        {!isSignedIn && (
          <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mb-3 text-center">
            You'll be asked to sign in first to link your data to your account.
          </p>
        )}

        {error && <p className="text-sm text-accent mb-3 text-center">{error}</p>}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mb-2"
        >
          {loading ? 'Redirecting to payment…' : 'Upgrade for ₱299'}
        </button>

        <button onClick={onClose} className="w-full py-2 text-sm text-muted hover:text-white transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  )
}
