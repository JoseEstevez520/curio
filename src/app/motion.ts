import type { Transition } from 'framer-motion';

/**
 * Shared-element morph for the mascot as it travels between the hero (empty state)
 * and the header (conversation). A slow, smooth glide on an iOS-like decelerating
 * curve — no bounce, no snap. Driven by Framer Motion's `layoutId`.
 */
export const MASCOT_MORPH: Transition = { duration: 0.5, ease: [0.32, 0.72, 0, 1] };

/**
 * Shared-element morph for the description surface as the small popover grows into the
 * "ver más" modal (and shrinks back). Same iOS decelerating curve as the mascot — a
 * smooth glide that grows into place, never a bounce or a whip. The OBJECT (the card)
 * morphs; its richer text content fades in on top (see DescribeModal). Register 2 of
 * docs/DESIGN.md §7.
 */
export const MODAL_MORPH: Transition = { duration: 0.44, ease: [0.32, 0.72, 0, 1] };

/** A clean, quick opacity fade for content entering on top of a morph (text, not object). */
export const CONTENT_FADE: Transition = { duration: 0.24, ease: [0.16, 1, 0.3, 1], delay: 0.08 };

/**
 * Shared `layoutId` for the description surface. The small popover and the "ver más"
 * modal both tag their card with this id, so Framer treats them as ONE object that
 * grows/shrinks between the two — the iOS-style shared-element morph. Only one element
 * with this id may be mounted at a time (see SelectionPopover).
 */
export const SURFACE_LAYOUT_ID = 'curio-describe-surface';
