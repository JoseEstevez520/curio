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

/**
 * "Ver más" modal entrance: a clean, UNIFORM scale-up (0.96→1) + fade, centered. A
 * shared-element morph from the tiny popover to a big modal whose content also loads async
 * proved jerky and distorting (anisotropic scale + a second layout resize when the generated
 * component arrives). A uniform scale never distorts and never re-animates layout, so it stays
 * smooth — the iOS "gentle grow" that presentations/alerts actually use. Decelerating, no bounce.
 */
export const MODAL_IN: Transition = { duration: 0.26, ease: [0.16, 1, 0.3, 1] };

/**
 * Fade for content entering on top of a morph (text, not object). Kept for reuse; the modal
 * now scales in as one piece (MODAL_IN), so content no longer needs a separate delayed fade.
 */
export const CONTENT_FADE: Transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 };

/** The flat modal scrim fading in/out — same decelerating ease as the rest, no bounce. */
export const SCRIM_FADE: Transition = { duration: 0.24, ease: [0.16, 1, 0.3, 1] };

/**
 * The active-segment indicator sliding between options of a segmented control (Texto/Gen UI,
 * Chat/Leer, Local/Groq). Register 2 (structural morph) at a small scale — the fill TRAVELS to
 * the chosen segment ("todo fluye a un lugar", DESIGN §9) instead of popping. Same decelerating
 * iOS curve as the big morphs, just shorter so a control tap stays crisp. No bounce.
 */
export const SEGMENT_SLIDE: Transition = { duration: 0.24, ease: [0.32, 0.72, 0, 1] };

/**
 * Shared `layoutId` for the description surface. The small popover and the "ver más"
 * modal both tag their card with this id, so Framer treats them as ONE object that
 * grows/shrinks between the two — the iOS-style shared-element morph. Only one element
 * with this id may be mounted at a time (see SelectionPopover).
 */
export const SURFACE_LAYOUT_ID = 'curio-describe-surface';
