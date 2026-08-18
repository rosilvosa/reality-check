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
        // Split the two big vendors out of the entry chunk. Both are cached
        // across releases, which matters more than total bytes on metered data.
        // The trailing separator keeps react-router-dom out of the react chunk.
        manualChunks(id) {
          if (/node_modules[\\/](firebase|@firebase)[\\/]/.test(id)) return 'firebase'
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
