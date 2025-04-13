import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    minify: 'esbuild',
    rollupOptions: {
      treeshake: true,
    },
  },

  optimizeDeps: {
    exclude: ['react-icons'],
  },

  server: {
    proxy: {
      // Proxy para desarrollo local (Edge Functions simuladas)
      '/api/edge': {
        target: "http://localhost:5000",
        rewrite: path => path.replace(/^\/api\/edge/, '/api'),
        changeOrigin: true,
        secure: false, // Desactivado para desarrollo local
        cookieDomainRewrite: 'localhost',
      },
    },
  },

  // Configuración especial para Vercel (producción)
  define: {
    'import.meta.env.VERCEL': JSON.stringify(process.env.VERCEL || false)
  }
})
