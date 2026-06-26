# Privacy and Security Audit Plan

Last updated: 2026-05-24

This plan keeps David's Beacon aligned with its security and privacy checklist and supports preparation for Philippines Data Privacy Act review.

## Audit Cadence

- Before every production launch: run the launch checklist.
- Monthly during active development: review backend rules and sensitive flows.
- Quarterly before scale: review privacy policy, retention, deletion, and admin access.
- After any incident or major backend change: run a targeted review immediately.

Major backend changes include Firestore rules, Realtime Database rules, Storage rules, Cloud Functions, invite/enrollment logic, SOS/location logic, and org access changes.

## Audit Areas

### 1. Data Inventory

Maintain a current list of collections, RTDB paths, Storage paths, and Cloud Functions.

Evidence to collect:

- Firestore schema notes.
- RTDB path list.
- Storage path list.
- Which roles can read/write each area.
- Whether data is personal information or sensitive personal information.

### 2. Access Control Review

Confirm each role can access only what it should.

Test cases:

- Family admin can manage own profiles.
- Co-carer can read shared profile but cannot perform owner-only edits.
- Org staff can access only enrolled dependents.
- Org staff cannot access another org's enrollments.
- Super admin can access Command Center review queues.
- Signed-out users cannot access private records.

Evidence to collect:

- Test account matrix.
- Screenshots or test logs.
- Firestore rules diff reviewed.

### 3. Consent And Sharing Review

Confirm sensitive sharing flows are explicit and understandable.

Flows:

- Create safety profile.
- Add emergency contacts.
- Share profile with co-carer.
- Accept co-carer invite.
- Enroll dependent with organization.
- Generate QR emergency profile.
- Use location sharing.
- Trigger SOS.

Evidence to collect:

- UI copy screenshots.
- Terms and Privacy Policy references.
- Any consent checkbox or confirmation behavior.

### 4. Deletion And Retention Review

Confirm deletion behavior matches the Privacy Policy.

Test cases:

- Delete safety profile.
- Remove profile photo.
- Delete account.
- Delete org notes where supported.
- Delete panic/session recordings where supported.
- Remove or expire invites.

Evidence to collect:

- Before/after data snapshots.
- Storage object deletion checks.
- RTDB cleanup checks.
- Known gaps logged.

### 5. Location, SOS, And QR Review

These are high-risk safety workflows.

Confirm:

- Location is not collected without user action.
- Location sharing scope is clear.
- SOS requires deliberate action.
- SOS visible data is limited to emergency purpose.
- QR output contains only emergency-relevant data.
- Public QR/emergency pages do not expose account-level data.

Evidence to collect:

- Mobile smoke test notes.
- Screenshots.
- Rules coverage for public/private access paths.

### 6. Organization Access Review

Confirm org access is enrollment-based and revocable.

Test cases:

- Org admin sees only their org.
- Staff sees only assigned/enrolled records.
- Unenrolled profile disappears from org views.
- Org invite acceptance does not over-grant access.
- Org notes and session clips remain org-scoped.

Evidence to collect:

- Test org accounts.
- Enrollment records.
- Screenshots or logs.

### 7. Privacy Policy And Terms Review

Confirm public documents match actual product behavior.

Review:

- Privacy Policy.
- Terms of Use.
- Security & Privacy page.
- Any consent copy in sensitive flows.

Evidence to collect:

- Document diff.
- Date reviewed.
- Reviewer notes.

### 8. Incident Response Readiness

Confirm the team knows what to do if data is exposed or misused.

Minimum process:

- Identify affected data.
- Preserve logs and evidence.
- Stop further exposure.
- Assess whether notification is required.
- Notify affected users and regulators if required.
- Document root cause and remediation.

Evidence to collect:

- Incident contact list.
- Draft breach response template.
- Post-incident report template.

## Launch Checklist

- [ ] Privacy Policy matches current app behavior.
- [ ] Terms explain safety limitations and emergency-use disclaimers.
- [ ] Security & Privacy page reflects current compliance posture.
- [ ] Firestore rules reviewed and deployed.
- [ ] Realtime Database rules reviewed and deployed.
- [ ] Storage rules reviewed and deployed.
- [ ] Family profile access tested.
- [ ] Co-carer invite access tested.
- [ ] Organization enrollment access tested.
- [ ] Super-admin access tested.
- [ ] SOS flow tested.
- [ ] Location flow tested.
- [ ] QR output reviewed.
- [ ] Account deletion tested across Auth, Firestore, RTDB, and Storage.
- [ ] Profile deletion tested.
- [ ] Data export process defined.
- [ ] Breach response process defined.
- [ ] Privacy contact confirmed.
- [ ] DPO/privacy owner function assigned before scale.
- [ ] Privacy Impact Assessment completed or scheduled.

## Current Known Gaps

- Data export process is not yet implemented.
- End-to-end account deletion needs full datastore verification.
- Formal Privacy Impact Assessment still needed.
- Retention policy for SOS, location, session clips, and notes needs final decision.
- Admin access policy and breach response process need written operating procedures.
- Legal/privacy review is still needed before broad public launch.

## Temporary Command Center Gate

Until real Firebase MFA is implemented, Command Center uses a temporary readiness gate:

- Production React requires `users/{uid}.adminSecurity.commandCenterMfaReady === true`.
- Local dev bypasses this flag for platform admins so Command Center can be built and tested.
- This is not a substitute for MFA.
- Replace this flag with Firebase MFA before v1 public release.
