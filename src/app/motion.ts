import type { Transition } from 'framer-motion';

/**
 * Shared-element morph for the mascot as it travels between the hero (empty state)
 * and the header (conversation). A slow, smooth glide on an iOS-like decelerating
 * curve — no bounce, no snap. Driven by Framer Motion's `layoutId`.
 */
export const MASCOT_MORPH: Transition = { duration: 0.5, ease: [0.32, 0.72, 0, 1] };
