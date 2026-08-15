import { NavLink } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="text-sm text-muted leading-relaxed space-y-4">
      <NavLink to="/settings" className="text-xs hover:text-white">← Settings</NavLink>
      <h2 className="text-lg font-extrabold text-white">Terms of Use</h2>
      <p>Last updated: 14 August 2026</p>
      <p>
        Reality Check is provided free, as-is, for personal recovery use. It does not diagnose or treat addiction.
        It is not a substitute for professional help.
      </p>
      <h3 className="text-white font-bold pt-2">The service</h3>
      <p>
        You may use the calculators, journal, streak tracker, and related tools. Local use needs no account.
        Signing in is optional and enables cloud backup. We do not sell your journal.
      </p>
      <h3 className="text-white font-bold pt-2">Donations</h3>
      <p>
        Donations are optional. They do not unlock features. They keep hosting running and help fund a safety
        app. Payments go through PayMongo or Ko-fi. Refunds follow the payment provider’s process; contact us
        if a charge was a mistake.
      </p>
      <h3 className="text-white font-bold pt-2">Acceptable use</h3>
      <p>
        Do not abuse the service, scrape it, or use it to target people in crisis. We may disable accounts that
        harm the service or other users.
      </p>
      <h3 className="text-white font-bold pt-2">Liability</h3>
      <p>
        The operator is not liable for decisions you make after using this tool, for data loss on a device you
        did not back up, or for PayMongo / Firebase outages. Use at your own risk.
      </p>
    </div>
  )
}
