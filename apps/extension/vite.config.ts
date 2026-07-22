import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

// Resolve @curio/core to its TypeScript source (shared, no separate build step).
const corePath = fileURLToPath(new URL('../../packages/core/src', import.meta.url));

// https://vite.dev/config/ — @crxjs reads manifest.json and bundles the content script,
// background worker and popup, emitting a loadable MV3 extension into dist/.
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: { '@curio/core': corePath },
    dedupe: ['react', 'react-dom'],
  },
});
