import { NavLink } from 'react-router-dom'
import { useContactStore } from '../stores/contactStore'

export default function Privacy() {
  const showContact = useContactStore((s) => s.show)
  return (
    <div className="text-sm text-muted leading-relaxed space-y-4">
      <NavLink to="/settings" className="text-xs hover:text-ink">← Settings</NavLink>
      <h2 className="text-lg font-extrabold text-ink">Privacy Policy</h2>
      <p>Last updated: 18 August 2026</p>
      <p>
        Reality Check is a personal gambling-recovery tool. It is not a medical service, therapy, or crisis hotline.
        If you are in immediate danger, contact local emergency services. In the Philippines the gambling helpline is PAGCOR NPGH (02) 8248-9568. NCMH 1553 is a mental-health crisis line, not a gambling service.
      </p>
      <h3 className="text-ink font-bold pt-2">What we store</h3>
      <p>
        Without an account, everything stays in your browser (localStorage): income settings, journal entries,
        streak, barriers checklist, and language. Nothing is uploaded.
      </p>
      <p>
        If you sign in, that same data is copied to Google Firebase (Firestore) in asia-southeast1, scoped to your
        user ID. We use Firebase Authentication (anonymous, Google, or email).
      </p>
      <h3 className="text-ink font-bold pt-2">Community</h3>
      <p>
        Community posts are stored in Firestore and shown to other signed-in users as Anonymous. We store your
        user ID on the post so you can delete it. Deleting your account also deletes your posts. Do not put
        your name, address, or anyone else’s identity in a post.
      </p>
      <h3 className="text-ink font-bold pt-2">Videos</h3>
      <p>
        The Watch page plays talks inside the app using YouTube&rsquo;s privacy-enhanced player
        (youtube-nocookie.com). Nothing loads from YouTube until you press play. Once you do, Google
        receives your IP address and can see which video you opened. We send no account or journal data
        with it. If you would rather not, do not press play.
      </p>
      <h3 className="text-ink font-bold pt-2">Your rights</h3>
      <p>
        You can delete your account and cloud data from Settings. That wipes your Firestore tree and local
        Reality Check keys. Under the Philippine Data Privacy Act you may
        {' '}<button type="button" onClick={showContact} className="text-accent hover:text-ink">use Contact</button>
        {' '}to request access or deletion.
      </p>
      <p>This app is run by an independent maintainer. Use Contact for any data or privacy request.</p>
    </div>
  )
}
