import { flushSync } from 'react-dom';

type DocWithVT = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

/**
 * Run a DOM-updating state change wrapped in a View Transition, so shared elements
 * (matching `view-transition-name`) morph between their old and new positions —
 * an iOS-style shared-element transition.
 *
 * `update` must SYNCHRONOUSLY trigger the React state change; we `flushSync` it so
 * the new DOM is committed before the browser snapshots. Falls back to a plain,
 * instant update when the API is unavailable or the user prefers reduced motion.
 */
export function withViewTransition(update: () => void): void {
  const doc = document as DocWithVT;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  if (typeof doc.startViewTransition !== 'function' || reduce) {
    update();
    return;
  }
  doc.startViewTransition(() => flushSync(update));
}
