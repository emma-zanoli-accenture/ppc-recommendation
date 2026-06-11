import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// On GitHub Pages the app is served from https://<user>.github.io/ppc-recommendation/,
// so production assets must be referenced under that sub-path. Local dev stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ppc-recommendation/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
