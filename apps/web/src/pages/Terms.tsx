import { NavLink } from 'react-router-dom'
import { useContactStore } from '../stores/contactStore'

export default function Terms() {
  const showContact = useContactStore((s) => s.show)
  return (
    <div className="text-sm text-muted leading-relaxed space-y-4">
      <NavLink to="/settings" className="text-xs hover:text-ink">← Settings</NavLink>
      <h2 className="text-lg font-extrabold text-ink">Terms of Use</h2>
      <p>Last updated: 15 August 2026</p>
      <p>
        Reality Check is provided free, as-is, for personal recovery use. It does not diagnose or treat addiction.
        It is not a substitute for professional help.
      </p>
      <h3 className="text-ink font-bold pt-2">The service</h3>
      <p>
        You may use the calculators, journal, streak tracker, and related tools. Local use needs no account.
        Signing in is optional and enables cloud backup. We do not sell your journal.
      </p>
      <h3 className="text-ink font-bold pt-2">Support</h3>
      <p>
        This app is free. We do not charge for features, nothing is locked behind a payment, and there are no
        ads. We do not sell anything and we do not ask you for money.
      </p>
      <h3 className="text-ink font-bold pt-2">Source code</h3>
      <p>
        The source is public under the PolyForm Noncommercial License. You may copy it, change it, and run your
        own free instance. You may not sell the software or charge people to use a copy. Please keep the name
        Reality Check and append your country or region — for example Reality Check US — so people know
        which one they opened. Do not present a copy as this site.
      </p>
      <h3 className="text-ink font-bold pt-2">Acceptable use</h3>
      <p>
        Do not abuse the service, scrape it, or use it to target people in crisis. We may disable accounts that
        harm the service or other users.
      </p>
      <h3 className="text-ink font-bold pt-2">Community</h3>
      <p>
        Posts are anonymous to other users. Do not share betting links, ask for money, or name another person.
        We may remove posts that break these rules. Community is not therapy and not a crisis line — use Find Help
        if you need a real number.
      </p>
      <h3 className="text-ink font-bold pt-2">Liability</h3>
      <p>
        The operator is not liable for decisions you make after using this tool, for data loss on a device you
        did not back up, or for Firebase outages. Use at your own risk.
      </p>
      <p>
        Questions: <button type="button" onClick={() => showContact()} className="text-accent hover:text-ink">Contact</button>
      </p>
    </div>
  )
}
