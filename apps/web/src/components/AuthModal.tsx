import { useState } from 'react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/auth'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'signin' | 'signup'

export default function AuthModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmail() {
    if (!email || !password) { setError('Enter email and password'); return }
    setError('')
    setLoading(true)
    try {
      if (tab === 'signin') await signInWithEmail(email, password)
      else await signUpWithEmail(email, password)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-surface border border-border rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-white mb-1">Account</h2>
        <p className="text-sm text-muted mb-5">Sign in to enable cloud sync across devices.</p>

        {/* Tabs */}
        <div className="flex border border-border rounded-lg overflow-hidden mb-5">
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                tab === t ? 'bg-surface2 text-white' : 'text-muted hover:text-white'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-gray-900 font-semibold rounded-lg mb-4 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted outline-none focus:border-accent mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted outline-none focus:border-accent mb-3"
        />

        {error && <p className="text-sm text-accent mb-3">{error}</p>}

        <button
          onClick={handleEmail}
          disabled={loading}
          className="w-full py-2.5 bg-accent text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}
