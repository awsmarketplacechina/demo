import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
