import type { Config } from 'tailwindcss';

// Design tokens (monochrome, Linear-inspired, no shadows) land in a later slice
// per docs/DESIGN.md. This is the minimal wiring so Tailwind classes work.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {},
  },
  // No shadow utilities are used anywhere in Curio (see docs/DESIGN.md §5).
  plugins: [],
} satisfies Config;
