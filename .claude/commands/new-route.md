Add a new route to David's Beacon. The user will specify the path, view file, and any access restrictions.

Always requires exactly two file edits:

## Step 1 — `src/constants/routes.ts`

Add a new key to the ROUTES object. Use SCREAMING_SNAKE_CASE for the key, kebab-case for the value:
```ts
MY_FEATURE: 'my-feature',
```
The value is the route `name` used with `router.push({ name: ROUTES.MY_FEATURE })`.

## Step 2 — `src/router/index.ts`

Add the route entry in the appropriate section (public / authenticated / role-restricted):

**Standard authenticated route:**
```ts
{
  path: '/my-feature',
  name: ROUTES.MY_FEATURE,
  component: () => import('@/views/MyFeatureView.vue'),
  meta: { requiresAuth: true, title: 'Page Title' },
},
```

**Role-restricted route:**
```ts
{
  path: '/my-feature',
  name: ROUTES.MY_FEATURE,
  component: () => import('@/views/MyFeatureView.vue'),
  meta: { requiresAuth: true, requiredRole: USER_ROLES.ORG_ADMIN, title: 'Page Title' },
},
```

**Public route (invite accept pattern — handles own auth state):**
```ts
{
  path: '/my-feature/:id',
  name: ROUTES.MY_FEATURE,
  component: () => import('@/views/MyFeatureView.vue'),
  meta: { title: 'Page Title' },
},
```

**Guest‑only route (redirects to home if already logged in):**
```ts
{
  path: '/my-feature',
  name: ROUTES.MY_FEATURE,
  component: () => import('@/views/MyFeatureView.vue'),
  meta: { guestOnly: true },
},
```

## Guards reference (already wired in `router/index.ts` — no changes needed)
- `requiresAuth: true` → redirects to landing if not signed in
- `requiredRole: USER_ROLES.XYZ` → redirects to home if role doesn't match
- `guestOnly: true` → redirects to home if already signed in
- No meta → public, no redirect

## After both edits
Remind Ron to link to the new route from wherever it should be navigated to (HomeView, BottomNav, a parent view, etc.).
