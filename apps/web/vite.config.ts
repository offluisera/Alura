import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    assetsInlineLimit: 10485760, // 10MB - Força inlining em Base64 para prevenir bugs de file:// no Electron
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
