import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..', 'dist');
const apiBase = 'http://127.0.0.1:3003';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
      const target = new URL(`${apiBase}${url.pathname}${url.search}`);
      const headers = { ...req.headers, host: target.host };
      delete headers.origin;
      const proxy = http.request(target, { method: req.method, headers }, upstream => {
        res.writeHead(upstream.statusCode || 502, upstream.headers);
        upstream.pipe(res);
      });
      proxy.on('error', error => {
        if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: `Proxy local: ${error.message}` }));
      });
      req.pipe(proxy);
      return;
    }

    const requested = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
    let file = path.resolve(root, requested);
    if (!file.startsWith(`${root}${path.sep}`) && file !== path.join(root, 'index.html')) throw new Error('Ruta inválida');
    try { await fs.access(file); } catch { file = path.join(root, 'index.html'); }
    const content = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(content);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Error de vista previa: ${error.message}`);
  }
});

server.listen(5173, '0.0.0.0', () => console.log('Vista previa CMS: http://127.0.0.1:5173'));
