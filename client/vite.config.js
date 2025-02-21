import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild', // Asegura la minificación del código
    rollupOptions: {
      treeshake: true, // Intenta eliminar código no usado
    },
  },
  optimizeDeps: {
    exclude: ['react-icons'], // Evita que Vite precompile todo el paquete
  },
  server: {
    proxy: {
      '/api': {
        /* target: 'https://general-parts.onrender.com', */
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: true, // Asegúrate de usar HTTPS correctamente
        cookieDomainRewrite: 'localhost', // Reescribe el dominio de las cookies para que funcionen en localhost
      },
    },
  },
})
