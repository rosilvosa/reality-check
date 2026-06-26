Deploy the Vue app to Firebase Hosting. Follow these steps:

1. Ask Ron: "Deploy hosting only, or hosting + Firestore rules?" (skip if he already specified)
2. Run `npm run build` — if it fails, stop and report the errors; do not deploy a broken build
3. Based on what changed this session:
   - Always include `--only hosting`
   - Add `firestore:rules` if `firestore.rules` was modified this session
   - Add `storage` if `storage.rules` was modified this session
   - Never add targets that weren't changed
4. Run the deploy command, e.g.:
   `firebase deploy --only hosting`
   or
   `firebase deploy --only hosting,firestore:rules`
5. Confirm the Hosting URL in the output: should be `https://davids-beacon.web.app`
6. Report success or any errors to Ron

Important:
- The Firebase project is `davids-beacon` — never deploy to `masuat-david` (old vanilla JS app)
- `src/plugins/firebase.ts` contains placeholder API keys — do NOT commit or overwrite them
- If the build fails due to TypeScript errors you introduced this session, fix them first
