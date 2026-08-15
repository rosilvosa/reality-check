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
      <h3 className="text-white font-bold pt-2">Community</h3>
      <p>
        Community posts are stored in Firestore and shown to other signed-in users as Anonymous. We store your
        user ID on the post so you can delete it. Deleting your account also deletes your posts. Do not put
        your name, address, or anyone else’s identity in a post.
      </p>
      <h3 className="text-white font-bold pt-2">Support</h3>
      <p>
        Reality Check does not sell features. If you want to help, we ask you to support David’s Beacon — a free
        safety platform for special-needs families — by telling a family or opening davidsbeacon.com. There is
        no donation checkout in this app.
      </p>
      <h3 className="text-white font-bold pt-2">Your rights</h3>
      <p>
        You can delete your account and cloud data from Settings. That wipes your Firestore tree and local
        Reality Check keys. Under the Philippine Data Privacy Act you may also email
        {' '}<a href="mailto:hello@davidsbeacon.com" className="text-accent hover:text-white">hello@davidsbeacon.com</a>
        {' '}to request access or deletion.
      </p>
      <p>Operator: Ron Silvosa. Contact: hello@davidsbeacon.com</p>
    </div>
  )
}
