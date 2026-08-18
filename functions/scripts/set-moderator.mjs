/**
 * Grants or revokes the moderator custom claim.
 *
 * The claim is what lets an account delete other people's community posts and
 * read the report queue. Nothing in the app can grant it, on purpose.
 *
 * Credentials, in order of preference:
 *
 *   1. Application Default Credentials, which you already have if you have run
 *      `gcloud auth application-default login`. Nothing else to set up, and no
 *      private key ends up on disk.
 *   2. A service account key, via GOOGLE_APPLICATION_CREDENTIALS. Only needed
 *      if ADC is unavailable. Delete the key afterwards; it is project-wide
 *      admin sitting in a file.
 *
 * PowerShell:
 *
 *   cd functions
 *   node scripts/set-moderator.mjs you@example.com
 *   node scripts/set-moderator.mjs you@example.com --revoke
 *
 * With an explicit key file instead of ADC, note that PowerShell has no inline
 * env-var prefix, so it is two statements:
 *
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\\path\\to\\key.json'
 *   node scripts/set-moderator.mjs you@example.com
 *
 * The account must already exist in Firebase Auth, which means signing in to
 * the app with it at least once. Granting the claim to an address that has
 * never signed in is not possible: there is no user to attach it to.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
const revoke = process.argv.includes('--revoke')

if (!email || email.startsWith('--')) {
  console.error('Usage: node scripts/set-moderator.mjs <email> [--revoke]')
  process.exit(1)
}

// Read the project from .firebaserc rather than hardcoding it, so this cannot
// quietly point at the wrong project after a rename.
const here = dirname(fileURLToPath(import.meta.url))
let projectId
try {
  const rc = JSON.parse(readFileSync(join(here, '../../.firebaserc'), 'utf8'))
  projectId = rc.projects?.default
} catch {
  projectId = process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT
}
if (!projectId) {
  console.error('Could not determine the project id from .firebaserc.')
  process.exit(1)
}

initializeApp({ credential: applicationDefault(), projectId })
const auth = getAuth()

let user
try {
  user = await auth.getUserByEmail(email)
} catch (err) {
  if (err?.code === 'auth/user-not-found') {
    console.error(`No Firebase Auth user for ${email} in ${projectId}.`)
    console.error('Sign in to the app with that address once, then run this again.')
    process.exit(1)
  }
  throw err
}

const claims = { ...(user.customClaims ?? {}) }
if (revoke) delete claims.moderator
else claims.moderator = true

await auth.setCustomUserClaims(user.uid, claims)
// Forces existing sessions to pick the change up on their next token refresh.
await auth.revokeRefreshTokens(user.uid)

console.log(`${revoke ? 'Revoked' : 'Granted'} moderator for ${email} (${user.uid}) in ${projectId}.`)
console.log('Sign out and back in for it to apply on a device.')
