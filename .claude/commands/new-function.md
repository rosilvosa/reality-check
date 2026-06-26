Scaffold a new Cloud Function in David's Beacon. All functions live in `functions/src/index.ts` and deploy to the `asia-southeast1` region (set via `setGlobalOptions`).

## Step 1 — Clarify with Ron (ask only what isn't already clear)
- **Type:** `onCall` (callable from client) or trigger (`onDocumentCreated`, `onDocumentUpdated`, `onDocumentDeleted`)?
- **Trigger path** (triggers only): e.g. `org_applications/{appId}`
- **Auth:** super-admin only, any signed-in user, or public?
- **Email:** does it send an email via MailerSend? (needs `mailersendKey` secret)

## Step 2 — Read the current functions file
Read `functions/src/index.ts` to understand existing patterns before adding anything.

## Step 3 — Scaffold the function

**Callable (onCall) boilerplate:**
```ts
export const myFunctionName = onCall(
  // Add { secrets: [mailersendKey] } if sending email
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in')

    // Super admin check (if required):
    const callerSnap = await db.collection('users').doc(request.auth.uid).get()
    const callerRoles: any[] = callerSnap.data()?.['roles'] ?? []
    if (!callerRoles.length || callerRoles[0]['role'] !== 'super_admin') {
      throw new HttpsError('permission-denied', 'Super admin only')
    }

    const { fieldName } = request.data as { fieldName: string }
    if (!fieldName) throw new HttpsError('invalid-argument', 'fieldName required')

    // ... logic here ...

    return { success: true }
  },
)
```

**Trigger (onDocumentCreated) boilerplate:**
```ts
export const onMyDocCreated = onDocumentCreated(
  { document: 'collection/{docId}', secrets: [mailersendKey] },
  async (event) => {
    const data = event.data?.data()
    if (!data) return

    // ... logic here ...
  },
)
```

**Trigger (onDocumentUpdated) boilerplate:**
```ts
export const onMyDocUpdated = onDocumentUpdated(
  { document: 'collection/{docId}', secrets: [mailersendKey] },
  async (event) => {
    const before = event.data?.before.data()
    const after  = event.data?.after.data()
    if (!before || !after) return
    if (before['field'] === after['field']) return  // no-op guard

    // ... logic here ...
  },
)
```

## Step 4 — Remind Ron after writing
```
cd functions && npm run build
```
Then deploy:
```
firebase deploy --only functions
```

## Rules
- Never use `undefined` in RTDB writes — always convert to `null`
- Always use `FieldValue.serverTimestamp()` for timestamp fields, never `new Date()`
- Import secrets (`mailersendKey`, `adminEmail`) from `./email.js` — never hardcode
- Region is set globally via `setGlobalOptions` — do not set it per-function
- All Firestore writes that touch `roles` or `orgIds` must be server-side (never trust the client)
