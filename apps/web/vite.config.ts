import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Resolve @curio/core to its TypeScript SOURCE (not a built bundle), so the web app and the
// core share one codebase with instant HMR and no separate build step. Vite/esbuild
// transpiles the .ts/.tsx on the fly.
const corePath = fileURLToPath(new URL('../../packages/core/src', import.meta.url));

/**
 * Dev-only dynamic proxy for any OpenAI-compatible cloud brain. The browser can't call an
 * arbitrary LLM endpoint directly (CORS), so it calls `/llm/<path>` on the dev server with the
 * real endpoint in the `x-llm-base-url` header; we forward the request there (Authorization passed
 * through) and stream the response back — SSE included. This is what lets a user paste ANY base URL
 * + key in the UI. It only runs on the local dev server (never a production build), and only
 * forwards to the URL the user's own browser supplies, so it isn't an open relay for anyone else.
 */
function llmProxy(): Plugin {
  return {
    name: 'curio-llm-proxy',
    configureServer(server) {
      server.middlewares.use('/llm', (req, res) => {
        const base = (req.headers['x-llm-base-url'] as string | undefined)?.trim().replace(/\/$/, '');
        if (!base || !/^https?:\/\//i.test(base)) {
          res.statusCode = 400;
          res.end('Missing or invalid x-llm-base-url header');
          return;
        }
        const target = base + (req.url ?? '');
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          const headers: Record<string, string> = { 'content-type': 'application/json' };
          if (req.headers.authorization) headers.authorization = req.headers.authorization as string;
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
          void (globalThis as { fetch: typeof fetch })
            .fetch(target, {
              method: req.method,
              headers,
              body: hasBody ? Buffer.concat(chunks) : undefined,
            })
            .then(async (upstream) => {
              res.statusCode = upstream.status;
              const ct = upstream.headers.get('content-type');
              if (ct) res.setHeader('content-type', ct);
              res.setHeader('cache-control', 'no-cache');
              if (!upstream.body) {
                res.end();
                return;
              }
              const reader = upstream.body.getReader();
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
              }
              res.end();
            })
            .catch((e: unknown) => {
              res.statusCode = 502;
              res.end(`LLM proxy error: ${(e as Error).message}`);
            });
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), llmProxy()],
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
