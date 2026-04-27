import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://naija-cars-api.onrender.com',
        changeOrigin: true,
        secure: true,
        headers: {
          Origin: 'https://www.naijacars.online',
        },
      },
    },
  },
})
