import { useState } from 'react'
import { VOID_OPTIONS } from '@rc/core'
import type { VoidType } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'
import { useT } from '../i18n'

export default function VoidSection() {
  const { voidType, setVoidType } = useSettingsStore()
  const [selecting, setSelecting] = useState(false)
  const [pending, setPending] = useState<VoidType | null>(null)
  const [saving, setSaving] = useState(false)
  const t = useT()

  const activeT = voidType ? t.void[voidType] : null

  async function handleSave() {
    if (!pending) return
    setSaving(true)
    await setVoidType(pending)
    setSaving(false)
    setSelecting(false)
    setPending(null)
  }

  if (!voidType || selecting) {
    return (
      <div className="bg-[#111118] border border-[#232330] rounded-xl p-5 mb-4">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-1">
          {selecting ? t.progress.voidChanging : t.progress.voidLabel}
        </div>
        <p className="text-sm text-muted mb-4 leading-relaxed">{t.progress.voidHint}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {VOID_OPTIONS.map((o) => {
            const ot = t.void[o.type]
            return (
              <button
                key={o.type}
                onClick={() => setPending(o.type)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  pending === o.type
                    ? 'border-accent bg-accent/10'
                    : 'border-[#232330] bg-[#0d0d14] hover:border-accent/40'
                }`}
              >
                <div className="text-2xl mb-2">{ot.emoji}</div>
                <div className="text-white font-bold text-sm mb-1">{ot.label}</div>
                <div className="text-muted text-[12px] leading-snug">{ot.description}</div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!pending || saving}
            className="flex-1 py-3 bg-accent text-white font-black rounded-lg text-sm tracking-wider disabled:opacity-40 transition-opacity"
          >
            {saving ? t.progress.voidSaving : t.progress.voidSave}
          </button>
          {selecting && (
            <button
              onClick={() => { setSelecting(false); setPending(null) }}
              className="px-4 py-3 border border-[#232330] text-muted font-bold rounded-lg text-sm hover:text-white transition-colors"
            >
              {t.common.cancel}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111118] border border-[#232330] rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-muted uppercase tracking-widest font-bold">{t.progress.voidWhenUrge}</div>
        <button
          onClick={() => setSelecting(true)}
          className="text-[11px] text-muted hover:text-white border border-[#232330] px-2.5 py-1 rounded-lg transition-colors"
        >
          {t.progress.voidChange}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{activeT!.emoji}</span>
        <div>
          <div className="text-white font-black text-base">{activeT!.label}</div>
          <div className="text-muted text-[12px]">{activeT!.description}</div>
        </div>
      </div>

      <div className="bg-[#0d0d14] border-l-4 border-accent rounded-r-lg p-3 mb-4">
        <p className="text-accent text-[13px] font-bold leading-relaxed">{activeT!.reframe}</p>
      </div>

      <div className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">{t.progress.voidTryInstead}</div>
      <div className="space-y-2">
        {activeT!.alternatives.map((alt) => (
          <div key={alt} className="flex items-start gap-2">
            <span className="text-accent text-sm mt-0.5 shrink-0">→</span>
            <span className="text-white text-sm leading-relaxed">{alt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
