
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@infradeck/shared': new URL('../../packages/shared/src', import.meta.url).pathname },
    dedupe: ['react', 'react-dom'],
  }
})