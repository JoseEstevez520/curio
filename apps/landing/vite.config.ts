import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Same alias as apps/web/vite.config.ts: resolve @curio/core to its TypeScript source, so the
// landing page can reuse the REAL catalog components (Comparison, DefinitionCard, …) instead of
// approximating them.
const corePath = fileURLToPath(new URL('../../packages/core/src', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@curio/core': corePath },
    dedupe: ['react', 'react-dom'],
  },
});
