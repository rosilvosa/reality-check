Scaffold a new Vue view file for David's Beacon. The user will specify the view name and purpose.

Steps:

1. Confirm the filename (e.g. `MyFeatureView.vue`) and where it lives (`src/views/`)
2. Determine which stores it needs (auth, profiles, orgInvites, orgNotes, etc.)
3. Create the file with this standard boilerplate — adapt sections to fit the feature:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth'
// import other stores as needed

const router = useRouter()
const auth = useAuthStore()
// const store = useXyzStore()

// ── State ─────────────────────────────────────────────────
const loading = ref(false)
const error = ref('')

// ── Computed ──────────────────────────────────────────────

// ── Methods ───────────────────────────────────────────────

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  // fetch data
})
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-4">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-xl font-bold text-gray-800">Page Title</h1>
        <p class="text-sm text-gray-500 mt-0.5">Subtitle</p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <!-- loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        {{ error }}
      </div>

      <!-- main content -->
      <div v-else>
        <!-- TODO -->
      </div>
    </div>
  </div>
</template>
```

4. After creating the file, remind Ron to:
   - Add a route in `src/router/index.ts`
   - Add the route name constant in `src/constants/routes.ts`
   - Link to it from the relevant nav or parent view

Style rules (from CLAUDE.md):
- `bg-slate-100` (`#f1f5f9`) for all page root divs — never `bg-white` or `bg-stone-50` as root
- Tailwind only — no inline styles except exact pixel values Tailwind can't express
- Touch targets large (min 44px), mobile‑first always
- Amber accent for primary actions, red for destructive, purple for org/staff context
- Loading spinner: `border-amber-400 border-t-transparent`
