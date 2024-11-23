import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_PROD_SERVER_URL || "http://localhost:5000",
        secure: process.env.VITE_PROD_SERVER_URL ? true : false,
      },
    },
  },
})
