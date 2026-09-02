import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(configDir, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Rollup decide los chunks para evitar dependencias circulares entre React y DnD Kit.
    chunkSizeWarningLimit: 900,
  }
});
