import type { Config } from 'tailwindcss';

// Mirrors apps/web's token→utility mapping so @curio/core's catalog components render
// identically inside the extension's shadow root. No shadows anywhere (docs/DESIGN.md §5).
export default {
  content: [
    './src/**/*.{ts,tsx}',
    // Scan the shared catalog components so their utility classes are emitted.
    '../../packages/core/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          subtle: 'var(--color-bg-subtle)',
          muted: 'var(--color-bg-muted)',
          inset: 'var(--color-bg-inset)',
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          secondary: 'var(--color-fg-secondary)',
          muted: 'var(--color-fg-muted)',
          faint: 'var(--color-fg-faint)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          subtle: 'var(--color-accent-subtle)',
          fg: 'var(--color-accent-fg)',
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
    },
  },
  plugins: [],
} satisfies Config;
