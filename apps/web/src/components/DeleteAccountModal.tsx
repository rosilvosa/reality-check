import { useEffect, useState } from 'react'
import { useT } from '../i18n'

interface Props {
  open: boolean
  busy?: boolean
  onSaveCopy: () => void
  onConfirm: () => void
  onClose: () => void
}

// Two steps on purpose. This wipes a recovery journal with no undo, and it used
// to sit one tap away from Sign out with only colour telling them apart.
export default function DeleteAccountModal({
  open, busy = false, onSaveCopy, onConfirm, onClose,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const t = useT()

  useEffect(() => {
    if (open) setStep(1)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <button
        type="button"
        aria-label={t.common.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm bg-surface border border-border rounded-xl p-6 shadow-2xl">
        {step === 1 ? (
          <>
            <h2 id="delete-title" className="text-lg font-bold text-ink mb-2">
              {t.settings.dangerSection}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-4">{t.settings.deleteWhat}</p>
            <button
              type="button"
              onClick={onSaveCopy}
              className="w-full mb-4 py-2.5 border border-border rounded-lg text-sm font-semibold text-ink hover:border-accent"
            >
              {t.settings.deleteSaveFirst}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-muted hover:text-ink"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 border border-red-900 text-red-400 rounded-lg text-sm font-semibold hover:text-red-300"
              >
                {t.settings.deleteContinue}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="delete-title" className="text-lg font-bold text-ink mb-2">
              {t.settings.deleteFinalTitle}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-5">{t.settings.deleteFinalBody}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={busy}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-muted hover:text-ink disabled:opacity-50"
              >
                {t.common.back}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="flex-1 py-2.5 bg-red-700 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {busy ? '…' : t.settings.deleteFinalBtn}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}