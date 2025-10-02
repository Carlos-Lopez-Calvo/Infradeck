import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ✅ CORREGIDO: Path absoluto al index.ts
      '@infradeck/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts')
    },
    dedupe: ['react', 'react-dom'],
  }
})