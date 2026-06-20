import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The backend (Nest, :3000) is proxied under /api so the app can use relative
// URLs and avoid CORS in development. `npm run dev:mock` instead serves a Prism
// mock on :4010 — point this target there if you want contract-only data.
const API_TARGET = process.env.VITE_PROXY_TARGET ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
