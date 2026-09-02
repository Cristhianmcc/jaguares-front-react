import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const server = await createServer({
  root,
  configFile: false,
  plugins: [react()],
  resolve: { alias: { '@': path.join(root, 'src') } },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3003', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:3003', changeOrigin: true },
    },
  },
});

await server.listen();
server.printUrls();
