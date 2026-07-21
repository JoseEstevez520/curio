import { useEffect, useRef, useState } from 'react';
import curioBody from '../assets/curio-body.png';

interface CurioLogoProps {
  /** Rendered width/height of the blob, in px. Eyes scale proportionally. */
  size?: number;
  /** Pupils follow the cursor (adds a document mousemove listener). */
  track?: boolean;
  /** Gentle idle breathing + the occasional blink. */
  alive?: boolean;
  className?: string;
  /** Accessible name; the blob is Curio's mascot, so it labels the mark. */
  title?: string;
}

/**
 * Curio's mascot: a 3D blob rendered as a PNG (eyeless) with the eyes drawn on
 * top in CSS so they can track the cursor and blink independently. Proportions
 * are measured from the render — see logo/logo.md and logo/prototype.html.
 *
 * Only transform/opacity animate, so everything rides the compositor. All motion
 * is gated behind the caller's `alive`/`track` flags and prefers-reduced-motion.
 */

// Eye centers as a percentage of the blob box.
const EYE_Y = 54;
const EYE_LEFT_X = 33;
const EYE_RIGHT_X = 58.5;
// Pupil diameter and max travel, as a fraction of `size`.
const PUPIL_RATIO = 0.105;
const MOVE_RATIO = 0.0175;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export default function CurioLogo({
  size = 72,
  track = false,
  alive = false,
  className,
  title = 'Curio',
}: CurioLogoProps) {
  const leftPupil = useRef<HTMLDivElement>(null);
  const rightPupil = useRef<HTMLDivElement>(null);
  const [blinking, setBlinking] = useState(false);

  // Pupils follow the cursor: nudge each pupil toward the pointer, capped at a
  // small fraction of the blob so the gaze stays subtle. Throttled to one rAF.
  useEffect(() => {
    if (!track || prefersReducedMotion()) return;
    const max = size * MOVE_RATIO;
    let frame = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      frame = 0;
      const transform = `translate(${px}px, ${py}px)`;
      if (leftPupil.current) leftPupil.current.style.transform = transform;
      if (rightPupil.current) rightPupil.current.style.transform = transform;
    };

    const onMove = (e: MouseEvent) => {
      const el = leftPupil.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const ratio = Math.min(dist, 320) / 320;
      px = (dx / dist) * max * ratio;
      py = (dy / dist) * max * ratio;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [track, size]);

  // Life: an occasional blink on a randomized cadence (2–5s), like the prototype.
  useEffect(() => {
    if (!alive || prefersReducedMotion()) return;
    let blinkTimer = 0;
    let openTimer = 0;
    const schedule = () => {
      blinkTimer = window.setTimeout(
        () => {
          setBlinking(true);
          openTimer = window.setTimeout(() => {
            setBlinking(false);
            schedule();
          }, 130);
        },
        2500 + Math.random() * 2500,
      );
    };
    schedule();
    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(openTimer);
    };
  }, [alive]);

  const pupil = size * PUPIL_RATIO;
  const eyeStyle = (leftX: number) => ({
    left: `${leftX}%`,
    top: `${EYE_Y}%`,
    width: `${pupil}px`,
    height: `${pupil}px`,
    marginLeft: `${-pupil / 2}px`,
    marginTop: `${-pupil / 2}px`,
  });

  const classes = ['curio-logo', alive && 'curio-logo-alive', blinking && 'is-blinking', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="img"
      aria-label={title}
    >
      <img src={curioBody} alt="" aria-hidden="true" />
      <div className="curio-eye" style={eyeStyle(EYE_LEFT_X)}>
        <div className="curio-pupil" ref={leftPupil} />
      </div>
      <div className="curio-eye" style={eyeStyle(EYE_RIGHT_X)}>
        <div className="curio-pupil" ref={rightPupil} />
      </div>
    </div>
  );
}
