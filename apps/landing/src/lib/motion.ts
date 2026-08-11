import { animate } from 'framer-motion';

// Stronger custom curves than the CSS built-ins (per Emil Kowalski's animation notes:
// https://github.com/emilkowalski/skills) — the default `ease-out` is too weak to feel intentional.
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];

const HEADER_OFFSET = 72;

/** Animated scroll to an element by id, on our own curve — not the browser's native smooth-scroll. */
export function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const targetY = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  animate(window.scrollY, targetY, {
    duration: 0.6,
    ease: EASE_IN_OUT,
    onUpdate: (v) => window.scrollTo(0, v),
  });
}
