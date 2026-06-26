Scaffold a new Pinia store file for David's Beacon. The user will specify the store name and purpose.

Steps:

1. Confirm the filename (e.g. `myFeature.ts`) and that it lives in `src/stores/`
2. Determine which Firestore collections it touches and what operations are needed
3. Create the file with this standard boilerplate — adapt to fit the feature:

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import { useAuthStore } from './auth'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MyItem {
  id: string
  // ...fields
  createdAt: any
  updatedAt: any
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useMyFeatureStore = defineStore('myFeature', () => {
  const items = ref<MyItem[]>([])
  const loading = ref(false)

  function getAuth() {
    const auth = useAuthStore()
    if (!auth.uid) throw new Error('Not authenticated')
    return auth
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async function fetchItems(): Promise<void> {
    const auth = getAuth()
    loading.value = true
    try {
      const q = query(
        collection(db, 'my_collection'),
        where('uid', '==', auth.uid),
        orderBy('createdAt', 'desc'),
      )
      const snap = await getDocs(q)
      items.value = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<MyItem, 'id'>) })
    } finally {
      loading.value = false
    }
  }

  // ── Write ───────────────────────────────────────────────────────────────────

  async function addItem(params: Omit<MyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const auth = getAuth()
    const data = {
      ...params,
      uid: auth.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'my_collection'), data)
    items.value.unshift({ id: docRef.id, ...data })
  }

  async function updateItem(id: string, changes: Partial<Omit<MyItem, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, 'my_collection', id), { ...changes, updatedAt: serverTimestamp() })
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...changes }
  }

  async function deleteItem(id: string): Promise<void> {
    await deleteDoc(doc(db, 'my_collection', id))
    items.value = items.value.filter(i => i.id !== id)
  }

  return {
    items, loading,
    fetchItems, addItem, updateItem, deleteItem,
  }
})
```

4. After creating the file, remind Ron to:
   - Add the new Firestore collection to `firestore.rules` before deploying
   - Import and use the store in the relevant view(s)

Store conventions:
- Always use `getAuth()` guard — throw if not authenticated rather than silently returning
- `loading.value = true` inside the function, `finally` block resets it — never leave loading stuck on error
- Optimistic local updates after Firestore writes (unshift/splice/filter) — don't re-fetch the whole list
- `serverTimestamp()` for `createdAt` and `updatedAt` — never `new Date()`
- RTDB writes: always convert `undefined` → `null` before writing (RTDB rejects undefined)
- For org‑scoped stores: use `getOrgContext()` pattern (see `orgInvites.ts`) to extract orgId/orgName from auth roles
