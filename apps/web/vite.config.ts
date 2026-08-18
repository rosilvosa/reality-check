import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@rc/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Only React is pinned. Grouping all of firebase/* into one chunk was
        // forcing the Firestore SDK to load with Auth, which cancelled out the
        // dynamic imports in lib/cloud and lib/roomLive; Rollup splits it
        // correctly on its own from the import graph.
        manualChunks(id) {
          if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
