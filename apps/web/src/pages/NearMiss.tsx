import { useState } from 'react'
import { useT } from '../i18n'
import { tpl } from '@rc/core'

export default function NearMiss() {
  const [input, setInput] = useState('')
  const [reframe, setReframe] = useState('')
  const t = useT()

  function handleReframe() {
    if (!input.trim()) return
    setReframe(input.trim())
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">{t.nearmiss.title}</h2>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.nearmiss.subtitle}</p>

      <div className="bg-surface border border-accent-dim rounded-xl p-5 mb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-dim text-accent px-2 py-0.5 rounded mb-3">
          {t.nearmiss.factTag}
        </span>
        <p className="text-white text-[15px] leading-relaxed">{t.nearmiss.factBody}</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          {t.nearmiss.labelWhat}
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setReframe('') }}
          placeholder={t.nearmiss.placeholder}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-base outline-none focus:border-accent mb-4"
        />
        <button
          onClick={handleReframe}
          disabled={!input.trim()}
          className="w-full bg-accent text-white font-bold py-3 rounded-lg disabled:opacity-40 transition-opacity"
        >
          {t.nearmiss.btn}
        </button>

        {reframe && (
          <div className="mt-4 bg-[#0f0a0a] border-2 border-accent rounded-xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-3">{t.nearmiss.overrideTag}</p>
            <p className="text-white font-bold text-[15px] leading-relaxed whitespace-pre-line">
              {tpl(t.nearmiss.overrideBody, { input: reframe })}
            </p>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{t.nearmiss.truthTag}</p>
        <p className="text-white font-bold text-[15px] leading-relaxed">{t.nearmiss.truthBody}</p>
      </div>
    </div>
  )
}
