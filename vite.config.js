import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Split inteligente: cada vendor en su propio chunk → mejor cache de browser
    // cuando solo cambia el código de la app, los chunks de vendor no cambian
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-swr':    ['swr'],
          'vendor-dndkit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        }
      }
    },
    chunkSizeWarningLimit: 600,  // kB — silencia avisos en chunks grandes del template
  }
});
