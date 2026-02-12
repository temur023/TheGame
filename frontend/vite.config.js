import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'determined-success-production-6aba.up.railway.app'
    ],
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: true
  }
})