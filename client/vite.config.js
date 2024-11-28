import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://general-parts.onrender.com',
        changeOrigin: true,
        secure: true, // Asegúrate de usar HTTPS correctamente
        cookieDomainRewrite: 'localhost', // Reescribe el dominio de las cookies para que funcionen en localhost
      },
    },
  },
})
