import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // Use relative paths for production build
  server: {
    allowedHosts: [
      'cloud-migration-app-tunnel-f4zslk6c.devinapps.com',
      'localhost'
    ]
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
