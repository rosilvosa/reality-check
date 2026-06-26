import { useState } from 'react'

export default function NearMiss() {
  const [input, setInput] = useState('')
  const [reframe, setReframe] = useState('')

  function handleReframe() {
    if (!input.trim()) return
    setReframe(input.trim())
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">Near-Miss Reframe</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">
        The "near-miss" is not a sign you are close to winning. It is a psychological weapon designed by casinos to keep your money flowing.
      </p>

      <div className="bg-surface border border-accent-dim rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-dim text-accent px-2 py-0.5 rounded mb-3">
          Psychological Fact
        </span>
        <p className="text-white text-[15px] leading-relaxed">
          Near-misses are <strong>programmed outcomes</strong>. Slot machines and betting algorithms are specifically
          calibrated to produce near-misses at a rate far above statistical chance. They trigger the same
          dopamine release as a real win. You are not unlucky.{' '}
          <strong>You are being chemically manipulated.</strong>
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          What happened?
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setReframe('') }}
          placeholder='e.g. "I missed the over by 1 point"'
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        />
        <button
          onClick={handleReframe}
          disabled={!input.trim()}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          REFRAME THIS NOW
        </button>

        {reframe && (
          <div className="mt-4 bg-[#0f0a0a] border-2 border-accent rounded-xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-3">⛔ System Override</p>
            <p className="text-white font-bold text-[15px] leading-relaxed">
              Error: Near-miss detected.<br /><br />
              "{reframe}"<br /><br />
              This is NOT a sign you are close to winning. This is a{' '}
              <strong>designed psychological trap</strong>. A near-miss produces the same neurochemical
              response as a real win — which is exactly why it was engineered this way.<br /><br />
              You did not <em>almost</em> win. You <strong>lost</strong>. The outcome was a 100% financial
              loss. The sensation you are feeling is manufactured. If you gamble again right now, you will
              lose again.<br /><br />
              <strong>Close this and do not place another bet.</strong>
            </p>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">The Only True Statement</p>
        <p className="text-white font-bold text-[15px] leading-relaxed">
          There is no such thing as "almost winning." You either won or you lost. You lost.
          A near-miss is a 100% financial loss dressed up to keep you playing. The casino did not
          almost give you money — it took your money and showed you a consolation animation.
        </p>
      </div>
    </div>
  )
}
