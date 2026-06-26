Update the FeedbackView.vue roadmap with new entries. The user will describe what shipped, what's planned, or what bug was fixed.

The file is at: `src/views/FeedbackView.vue`

## The three data arrays (all in the `<script setup>` block)

### 1. `appUpdates` — the Updates tab (shown first, most visible)
Add new entries at the TOP of the array (newest first).
```ts
{
  id: 'u<N>',                          // next sequential number
  type: 'shipped',                     // 'shipped' | 'announcement' | 'status_change'
  title: 'Short title of what shipped',
  body: 'One or two sentences describing the feature and its value to users.',
  date: 'Apr 18',                      // human‑readable, no year
  read: readUpdateIds.has('u<N>'),     // always this exact pattern
},
```

### 2. `features` — the Features tab
Add new entries or update `status` on existing ones.
```ts
{
  id: 'f<N>',                          // next sequential number
  title: 'Feature name',
  body: 'Description from the user perspective.',
  votes: 0,                            // start at 0 for new; keep existing votes when updating status
  status: 'shipped',                    // 'planned' | 'in_progress' | 'shipped' | 'under_review'
  votedByMe: false,
  author: 'Ron',                        // 'Ron' for first‑party features, 'Anonymous' otherwise
  createdAt: 'Apr 18',
  showComments: false, newComment: '', comments: [],
},
```
When a feature ships: find its existing entry and change `status` to `'shipped'` — do NOT add a duplicate.

### 3. `bugs` — the Bugs tab
```ts
{
  id: 'b<N>',
  title: 'Bug description',
  body: 'What was wrong.',
  votes: 0,
  status: 'shipped',                   // 'shipped' once fixed; 'under_review' if open
  votedByMe: false,
  author: 'Ron',
  createdAt: 'Apr 18',
  showComments: false, newComment: '',
  comments: [
    { id: 'c<N>', author: 'Ron', body: 'Fixed — brief explanation.', createdAt: 'Apr 18' },
  ],
},
```

## Rules
- Always read the file first to find the next `id` numbers (u, f, b, c) and confirm existing entries
- Use Read with offset/limit to find just the array tops — don't load the whole 600‑line file unless needed
- `appUpdates` array starts around line 219; `features` around line 79; `bugs` around line 160 (line numbers shift over time — grep if needed)
- After editing, remind Ron to deploy with `/deploy` so users see the updates
