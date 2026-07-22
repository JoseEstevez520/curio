import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Resolve @curio/core to its TypeScript SOURCE (not a built bundle), so the web app and the
// core share one codebase with instant HMR and no separate build step. Vite/esbuild
// transpiles the .ts/.tsx on the fly.
const corePath = fileURLToPath(new URL('../../packages/core/src', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@curio/core': corePath },
    // One React instance across the workspace (avoids "invalid hook call").
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      // Same-origin path to the local Ollama daemon → no CORS, no user config.
      // The browser only ever calls `/ollama/api/...`.
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
});
