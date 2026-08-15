import { NavLink } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="text-sm text-muted leading-relaxed space-y-4">
      <NavLink to="/settings" className="text-xs hover:text-white">← Settings</NavLink>
      <h2 className="text-lg font-extrabold text-white">Privacy Policy</h2>
      <p>Last updated: 14 August 2026</p>
      <p>
        Reality Check is a personal gambling-recovery tool. It is not a medical service, therapy, or crisis hotline.
        If you are in immediate danger, contact local emergency services. In the Philippines the gambling helpline is PAGCOR NPGH (02) 8248-9568. NCMH 1553 is a mental-health crisis line, not a gambling service.
      </p>
      <h3 className="text-white font-bold pt-2">What we store</h3>
      <p>
        Without an account, everything stays in your browser (localStorage): income settings, journal entries,
        streak, barriers checklist, and language. Nothing is uploaded.
      </p>
      <p>
        If you sign in, that same data is copied to Google Firebase (Firestore) in asia-southeast1, scoped to your
        user ID. We use Firebase Authentication (anonymous, Google, or email).
      </p>
      <h3 className="text-white font-bold pt-2">Donations</h3>
      <p>
        Optional donations are processed by PayMongo (GCash, Maya, cards, QRPH) or Ko-fi. We do not store card
        numbers. PayMongo may store payment records under their own policy. Donations keep cloud sync available
        to anyone and help fund a safety app. They are voluntary payments, not tax-deductible charity gifts.
      </p>
      <h3 className="text-white font-bold pt-2">Your rights</h3>
      <p>
        You can delete your account and cloud data from Settings. That wipes your Firestore tree and local
        Reality Check keys. Under the Philippine Data Privacy Act you may also email the operator to request
        access or deletion.
      </p>
      <p>Operator: Ron Silvosa. Contact via Ko-fi (ko-fi.com/rosilvosa) or the GitHub repo owner.</p>
    </div>
  )
}
