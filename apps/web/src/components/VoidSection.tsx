import { useState } from 'react'
import { VOID_OPTIONS } from '@rc/core'
import type { VoidType } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'

export default function VoidSection() {
  const { voidType, setVoidType } = useSettingsStore()
  const [selecting, setSelecting] = useState(false)
  const [pending, setPending] = useState<VoidType | null>(null)
  const [saving, setSaving] = useState(false)

  const active = VOID_OPTIONS.find((o) => o.type === voidType)

  async function handleSave() {
    if (!pending) return
    setSaving(true)
    await setVoidType(pending)
    setSaving(false)
    setSelecting(false)
    setPending(null)
  }

  // ── Not set yet: show full quiz ──────────────────────────────────────────────
  if (!voidType || selecting) {
    return (
      <div className="bg-[#111118] border border-[#232330] rounded-xl p-5 mb-4">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-1">
          {selecting ? 'Change Recovery Profile' : 'Understanding Your Urge'}
        </div>
        <p className="text-sm text-muted mb-4 leading-relaxed">
          Gambling fills a specific need. Knowing which one is the key to replacing it. Pick the one that fits you best.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {VOID_OPTIONS.map((o) => (
            <button
              key={o.type}
              onClick={() => setPending(o.type)}
              className={`text-left p-4 rounded-xl border transition-all ${
                pending === o.type
                  ? 'border-accent bg-accent/10'
                  : 'border-[#232330] bg-[#0d0d14] hover:border-accent/40'
              }`}
            >
              <div className="text-2xl mb-2">{o.emoji}</div>
              <div className="text-white font-bold text-sm mb-1">{o.label}</div>
              <div className="text-muted text-[12px] leading-snug">{o.description}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!pending || saving}
            className="flex-1 py-3 bg-accent text-white font-black rounded-lg text-sm tracking-wider disabled:opacity-40 transition-opacity"
          >
            {saving ? 'SAVING...' : 'SAVE & SEE YOUR ALTERNATIVES'}
          </button>
          {selecting && (
            <button
              onClick={() => { setSelecting(false); setPending(null) }}
              className="px-4 py-3 border border-[#232330] text-muted font-bold rounded-lg text-sm hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Already set: show profile + alternatives ─────────────────────────────────
  return (
    <div className="bg-[#111118] border border-[#232330] rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold">When the Urge Hits</div>
        <button
          onClick={() => setSelecting(true)}
          className="text-[11px] text-muted hover:text-white border border-[#232330] px-2.5 py-1 rounded-lg transition-colors"
        >
          Change
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{active!.emoji}</span>
        <div>
          <div className="text-white font-black text-base">{active!.label}</div>
          <div className="text-muted text-[12px]">{active!.description}</div>
        </div>
      </div>

      <div className="bg-[#0d0d14] border-l-4 border-accent rounded-r-lg p-3 mb-4">
        <p className="text-accent text-[13px] font-bold leading-relaxed">{active!.reframe}</p>
      </div>

      <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">Try Instead</div>
      <div className="space-y-2">
        {active!.alternatives.map((alt) => (
          <div key={alt} className="flex items-start gap-2">
            <span className="text-accent text-sm mt-0.5 shrink-0">→</span>
            <span className="text-white text-sm leading-relaxed">{alt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
