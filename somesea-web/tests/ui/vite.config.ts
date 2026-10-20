import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  root: resolve('tests/ui'),
  resolve: { alias: { '@': resolve('src') } },
  server: { host: '127.0.0.1', port: 4173, strictPort: true, fs: { allow: [resolve('.')] } },
});
