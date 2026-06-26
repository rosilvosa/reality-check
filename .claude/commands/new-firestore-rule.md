Add a Firestore security rule block for a new collection in David's Beacon.

The user will describe the collection name and who should be able to read/write it.

Steps:

1. Ask (if not already specified): collection name, and access pattern (user-scoped, org-scoped, public-read, admin-only, etc.)
2. Generate the rule block using the project's existing helpers — do NOT redefine helpers, they already exist in firestore.rules:
   - `isSignedIn()` — request.auth != null
   - `isOwner(uid)` — request.auth.uid == uid
   - `isLinkedTo(profileData)` — request.auth.uid in profileData.linkedUids
   - `isSharedWith(profileData)` — request.auth.token.email in profileData.sharedWithEmails
   - `isOrgMember(orgId)` — does a get() on users/{uid}, checks orgId in userData.orgIds
3. Insert the rule block into `firestore.rules` BEFORE the catch-all deny rule at the bottom:
```
// ── Deny everything else ──────────────────────────────────
match /{document=**} {
  allow read, write: if false;
}
```
4. Common patterns to use:

**User-scoped (owner only):**
```
match /my_collection/{docId} {
  allow read, write: if isSignedIn() && request.auth.uid == resource.data.uid;
  allow create:      if isSignedIn() && request.auth.uid == request.resource.data.uid;
}
```

**Org-scoped (any org member reads; create requires org membership):**
```
match /my_collection/{docId} {
  allow read:   if isSignedIn() && isOrgMember(resource.data.orgId);
  allow create: if isSignedIn() && isOrgMember(request.resource.data.orgId);
  allow update: if isSignedIn() && isOrgMember(resource.data.orgId);
  allow delete: if isSignedIn() && isOrgMember(resource.data.orgId);
}
```

**Public-read, secret-link pattern (Firestore IDs are unguessable):**
```
match /my_collection/{docId} {
  allow read:   if true;
  allow create: if isSignedIn() && ...;
  allow update: if isSignedIn() && ...;
  allow delete: if isSignedIn() && ...;
}
```

**Admin-only:**
```
match /my_collection/{docId} {
  allow read, write: if isSignedIn() &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles[0].role == 'super_admin';
}
```

5. Key pitfalls — always check:
   - On **create**: use `request.resource.data` (incoming doc), NOT `resource.data` (doesn't exist yet)
   - On **read/update/delete**: use `resource.data` (existing doc)
   - `isOrgMember()` does a `get()` call — costs one Firestore read per rule evaluation; avoid calling it multiple times in the same rule (use a local `let` if needed, but Firestore rules don't support reuse across `allow` statements — minimize get() calls)
   - The catch-all deny rule at the bottom blocks everything not explicitly allowed — never remove it
   - Subcollections must be matched separately: `match /parent/{id}/sub/{subId} { ... }`
6. After editing firestore.rules, remind Ron to deploy with:
   `firebase deploy --only firestore:rules`
   (or use `/deploy` which handles targeting automatically)
