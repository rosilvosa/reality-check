import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'
import { useContactStore } from '../stores/contactStore'
import { sendContactMessage } from '../lib/contact'

const TYPES = ['typeBug', 'typeQuestion', 'typePrivacy', 'typeOther'] as const

export default function ContactModal() {
  const t = useT()
  const open = useContactStore((s) => s.open)
  const hide = useContactStore((s) => s.hide)
  const [kind, setKind] = useState<(typeof TYPES)[number]>('typeQuestion')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setKind('typeQuestion')
    setName('')
    setEmail('')
    setMessage('')
    setSending(false)
    setSent(false)
    setError('')
  }, [open])

  async function submit() {
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setError('')
    try {
      await sendContactMessage({
        kind: t.contact[kind],
        name,
        email,
        message: text,
      })
      setSent(true)
    } catch {
      setError(t.contact.fail)
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={hide} />
      <div className="relative z-10 w-full max-w-sm bg-surface border border-border rounded-xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={hide}
          className="absolute top-4 right-4 text-muted hover:text-white text-lg"
        >
          ✕
        </button>

        {sent ? (
          <div>
            <h2 className="text-lg font-bold text-white mb-2">{t.contact.sentTitle}</h2>
            <p className="text-sm text-muted leading-relaxed mb-5">{t.contact.sentBody}</p>
            <button
              type="button"
              onClick={hide}
              className="w-full py-2.5 bg-accent text-white font-bold rounded-lg text-sm"
            >
              {t.common.close}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">{t.contact.title}</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">{t.contact.subtitle}</p>
            <NavLink
              to="/updates"
              onClick={hide}
              className="block text-xs text-accent hover:text-white mb-4"
            >
              {t.updates.seeList} →
            </NavLink>

            <label className="block text-xs font-bold text-muted mb-1.5">{t.contact.typeLabel}</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as (typeof TYPES)[number])}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent mb-3"
            >
              {TYPES.map((id) => (
                <option key={id} value={id}>{t.contact[id]}</option>
              ))}
            </select>

            <label className="block text-xs font-bold text-muted mb-1.5">
              {t.contact.nameLabel} <span className="font-normal">{t.contact.nameOptional}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.contact.namePh}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent mb-3"
            />

            <label className="block text-xs font-bold text-muted mb-1.5">
              {t.contact.emailLabel} <span className="font-normal">{t.contact.emailOptional}</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.contact.emailPh}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent mb-3"
            />

            <label className="block text-xs font-bold text-muted mb-1.5">{t.contact.messageLabel}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t.contact.messagePh}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent mb-3 resize-none"
            />

            {error && <p className="text-sm text-accent mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={sending || !message.trim()}
                className="flex-1 py-2.5 bg-accent text-white font-bold rounded-lg text-sm disabled:opacity-50"
              >
                {sending ? t.contact.sending : t.contact.send}
              </button>
              <button
                type="button"
                onClick={hide}
                className="px-4 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-white"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
