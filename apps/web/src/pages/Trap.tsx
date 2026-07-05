import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const HOUSE_EDGES = [
  { label: 'Sports Betting (vig/juice)', edge: 0.0455 },
  { label: 'Slot Machines', edge: 0.08 },
  { label: 'Online Casino / E-Sabong', edge: 0.10 },
]

export default function Trap() {
  const [weeklyBet, setWeeklyBet] = useState('')
  const [edgeIndex, setEdgeIndex] = useState(0)
  const [result, setResult] = useState<number | null>(null)

  function calculate() {
    const bet = parseFloat(weeklyBet)
    if (!bet || bet <= 0) return
    setResult(bet * 52 * HOUSE_EDGES[edgeIndex].edge)
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">The Trap</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">
        The system was engineered by psychologists and mathematicians. This is what it actually does to your brain — and your money.
      </p>

      {/* Section 1: The Skinner Box */}
      <div className="bg-surface border border-accent-dim rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-dim text-accent px-2 py-0.5 rounded mb-3">
          Why You Can't Stop
        </span>
        <p className="text-white text-[15px] leading-relaxed mb-4">
          In the 1950s, B.F. Skinner put pigeons in boxes with levers. Sometimes pressing the lever gave food. Sometimes it didn't. The rewards were random.
        </p>
        <p className="text-white text-[15px] leading-relaxed mb-4">
          The pigeons pressed the lever <strong>thousands of times</strong> — far more than if food came every time. They kept pressing even after the food stopped completely.
        </p>
        <p className="text-white text-[15px] leading-relaxed mb-4">
          This is called <strong>variable ratio reinforcement</strong>. It is the single most addictive behavioral pattern ever discovered.
        </p>
        <div className="bg-bg border-l-4 border-accent rounded-r-lg p-4">
          <p className="text-white font-bold text-[15px] leading-relaxed">
            Every slot machine. Every roulette wheel. Every sports bet. Is a Skinner box designed for humans. Random rewards. Unpredictable outcomes. Maximum compulsion.
          </p>
          <p className="text-accent font-bold text-sm mt-3">
            You are not playing a game. You are a pigeon pressing a lever.
          </p>
        </div>
      </div>

      {/* Section 2: The Near-Miss Science */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          The Near-Miss Is Not Luck
        </span>
        <p className="text-white text-[15px] leading-relaxed mb-3">
          A study published in <em>Nature Neuroscience</em> found that near-misses activate the brain's reward system <strong>almost identically to actual wins</strong>.
        </p>
        <p className="text-white text-[15px] leading-relaxed mb-3">
          Your brain literally cannot tell the difference between almost winning and winning. The sensation is the same. So you keep playing.
        </p>
        <p className="text-white text-[15px] leading-relaxed mb-3">
          Slot machines are programmed to show near-misses up to <strong>30% of the time</strong> — far above statistical chance. The outcome was determined the millisecond you pressed the button. The spinning reels are theater.
        </p>
        <div className="bg-[#0f0a0a] border border-accent-dim rounded-lg p-3">
          <p className="text-accent text-[13px] font-bold">
            Every "almost" you have ever experienced was carefully engineered to make you feel like luck is right around the corner. It was not luck. It was a trap.
          </p>
        </div>
      </div>

      {/* Section 3: Mathematical Certainty Calculator */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          Mathematical Certainty Calculator
        </span>
        <p className="text-sm text-muted mb-4 leading-relaxed">
          The house edge means you will lose. Not might lose. <strong className="text-white">Will lose.</strong> Enter your weekly bet to see the mathematics.
        </p>

        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Weekly Bet Amount (₱)
        </label>
        <input
          type="number"
          value={weeklyBet}
          onChange={(e) => { setWeeklyBet(e.target.value); setResult(null) }}
          placeholder="e.g. 500"
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        />

        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Type of Gambling
        </label>
        <select
          value={edgeIndex}
          onChange={(e) => { setEdgeIndex(parseInt(e.target.value)); setResult(null) }}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        >
          {HOUSE_EDGES.map((h, i) => (
            <option key={i} value={i}>{h.label} ({(h.edge * 100).toFixed(2)}% edge)</option>
          ))}
        </select>

        <button
          onClick={calculate}
          disabled={!weeklyBet || parseFloat(weeklyBet) <= 0}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          SHOW ME THE MATH
        </button>

        {result !== null && (
          <div className="mt-4 bg-[#0f0a0a] border-2 border-accent rounded-xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-3">Mathematical Outcome</p>
            <p className="text-3xl font-extrabold text-accent mb-2">
              ₱{Math.round(result).toLocaleString()} / year
            </p>
            <p className="text-white text-[15px] leading-relaxed">
              Betting ₱{parseFloat(weeklyBet).toLocaleString()} per week on {HOUSE_EDGES[edgeIndex].label.split(' (')[0]},
              you will lose approximately <strong>₱{Math.round(result).toLocaleString()}</strong> every year.
            </p>
            <p className="text-white text-[15px] leading-relaxed mt-3">
              Over 5 years: <strong className="text-accent">₱{Math.round(result * 5).toLocaleString()}</strong>
            </p>
            <p className="text-muted text-sm mt-3 leading-relaxed">
              This is not a prediction. This is probability mathematics. The only variable is how long it takes and how much you lose before you stop.
            </p>
          </div>
        )}
      </div>

      {/* Section 4: Dark Patterns */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded border border-border mb-3">
          How Betting Apps Trap You
        </span>
        <div className="space-y-3">
          {[
            {
              label: 'Deposit: instant. Withdrawal: 3–5 business days.',
              detail: 'Every hour your money stays in the app is another hour you might bet it. The friction is intentional.',
            },
            {
              label: 'Free bet offers = first hit free.',
              detail: 'Same psychology as drug dealers giving the first hit free. Get you hooked. Then extract everything.',
            },
            {
              label: 'Push notifications after you win.',
              detail: 'Timed to bring you back during the dopamine high — the exact moment you are most likely to bet again and lose it all.',
            },
            {
              label: 'Streak bonuses and achievements.',
              detail: 'Gamification that makes gambling feel like a game you are progressing in. You are progressing toward bankruptcy.',
            },
          ].map((item) => (
            <div key={item.label} className="bg-bg rounded-lg p-3 border-l-4 border-accent-dim">
              <p className="text-white text-[13px] font-bold mb-1">{item.label}</p>
              <p className="text-muted text-[13px] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: You are not broken */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">The Truth</p>
        <p className="text-white font-bold text-[15px] leading-relaxed mb-3">
          When you can't stop betting, that is not a character flaw. When you chase losses even though you know you shouldn't, that is not weakness.
        </p>
        <p className="text-white text-[15px] leading-relaxed mb-3">
          That is a normal brain responding normally to a system designed to be inescapable. The trap was built by experts. It has captured millions.
        </p>
        <p className="text-accent font-bold text-[15px] leading-relaxed">
          You are not broken. You are targeted. And now you know exactly how it works.
        </p>
      </div>

      {/* CTA to Barriers */}
      <NavLink
        to="/barriers"
        className="block w-full bg-accent text-white font-black py-4 rounded-xl text-center text-sm tracking-wider hover:opacity-90 transition-opacity"
      >
        BUILD YOUR BARRIERS →
      </NavLink>
    </div>
  )
}
