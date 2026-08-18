/**
 * Grants or revokes the moderator custom claim.
 *
 * The claim is what lets an account delete other people's community posts and
 * read the report queue. Nothing in the app can grant it, on purpose: it takes
 * a service account and a shell.
 *
 * Run from the functions directory so firebase-admin resolves:
 *
 *   cd functions
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
 *     node scripts/set-moderator.mjs you@example.com
 *
 * Add --revoke to take it away. The user must sign out and back in, or wait for
 * their token to refresh, before the change takes effect on their device.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
const revoke = process.argv.includes('--revoke')

if (!email || email.startsWith('--')) {
  console.error('Usage: node scripts/set-moderator.mjs <email> [--revoke]')
  process.exit(1)
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path.')
  process.exit(1)
}

initializeApp({ credential: applicationDefault() })
const auth = getAuth()

const user = await auth.getUserByEmail(email)
const claims = { ...(user.customClaims ?? {}) }
if (revoke) delete claims.moderator
else claims.moderator = true

await auth.setCustomUserClaims(user.uid, claims)
// Forces existing sessions to pick the change up on their next token refresh.
await auth.revokeRefreshTokens(user.uid)

console.log(`${revoke ? 'Revoked' : 'Granted'} moderator for ${email} (${user.uid}).`)
console.log('They need to sign out and back in for it to apply.')
