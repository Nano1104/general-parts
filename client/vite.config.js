import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        /* target: process.env.NODE_ENV === 'production'
          ? "https://general-parts.onrender.com"
          : "http://localhost:5000",
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',  */
        target: "http://localhost:8000"
      },
    },
  },
})
