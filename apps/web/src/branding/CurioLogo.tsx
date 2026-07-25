import { useEffect, useRef, useState } from 'react';
import curioBody from '../assets/curio-body.png';

interface CurioLogoProps {
  /** Rendered width/height of the blob, in px. Eyes scale proportionally. */
  size?: number;
  /** Pupils follow the cursor (adds a document mousemove listener). */
  track?: boolean;
  /** Gentle idle breathing + the occasional blink. */
  alive?: boolean;
  /** Reacts while the assistant is generating: a soft body wobble (eyes intact). */
  thinking?: boolean;
  /** Looking something up (a description is open): the monocle springs on, the eyes
   *  scan and the body sways. */
  inspecting?: boolean;
  /** Purely ornamental: hide from assistive tech (use when a visible "Curio"
   *  label already sits next to it, so the name isn't announced twice). */
  decorative?: boolean;
  className?: string;
  /** Accessible name; used only when not decorative. */
  title?: string;
}

/**
 * Curio's mascot: a 3D blob rendered as a PNG (eyeless) with the eyes drawn on
 * top in CSS so they can track the cursor and blink independently. Proportions
 * are measured from the render — see docs/logo/logo.md and docs/logo/prototype.html.
 *
 * Only transform/opacity animate, so everything rides the compositor. Idle motion
 * is gated behind `alive`/`track`; `thinking` reacts to generation and a click
 * squishes the blob.
 */

// Eye centers as a percentage of the blob box.
const EYE_Y = 54;
const EYE_LEFT_X = 33;
const EYE_RIGHT_X = 58.5;
// Pupil diameter and max travel, as a fraction of `size`.
const PUPIL_RATIO = 0.105;
const MOVE_RATIO = 0.0175;

export default function CurioLogo({
  size = 72,
  track = false,
  alive = false,
  thinking = false,
  inspecting = false,
  decorative = false,
  className,
  title = 'Curio',
}: CurioLogoProps) {
  const leftPupil = useRef<HTMLDivElement>(null);
  const rightPupil = useRef<HTMLDivElement>(null);
  const [blinking, setBlinking] = useState(false);
  const [squishing, setSquishing] = useState(false);

  // Pupils follow the cursor: nudge each pupil toward the pointer, capped at a
  // small fraction of the blob so the gaze stays subtle. Throttled to one rAF.
  useEffect(() => {
    if (!track) return;
    const max = size * MOVE_RATIO;
    let frame = 0;
    let mx = 0;
    let my = 0;

    // Read the pupil rect once per animation frame (not per event) so a burst of
    // mousemove events triggers at most one layout read.
    const apply = () => {
      frame = 0;
      const el = leftPupil.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const ratio = Math.min(dist, 320) / 320;
      const transform = `translate(${(dx / dist) * max * ratio}px, ${(dy / dist) * max * ratio}px)`;
      if (leftPupil.current) leftPupil.current.style.transform = transform;
      if (rightPupil.current) rightPupil.current.style.transform = transform;
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
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
    if (!alive) return;
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

  // One body animation at a time, by priority: a click squish wins, then inspecting
  // sway, then thinking, then idle breathing. Exclusive so two never fight `transform`.
  const bodyAnim = squishing
    ? 'curio-logo-squish'
    : inspecting
      ? 'curio-logo-sway'
      : thinking
        ? 'curio-logo-thinking'
        : alive
          ? 'curio-logo-alive'
          : '';

  const classes = [
    'curio-logo',
    bodyAnim,
    blinking && 'is-blinking',
    inspecting && 'is-inspecting',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Monocle sits over the right eye and scales with the blob (see docs/logo/logo.md).
  // A real monocle rings well past the eye, so it's a sizeable fraction of the face.
  const mono = size * 0.42;
  const monocleStyle = {
    left: '61%',
    top: '57%',
    width: `${mono}px`,
    height: `${mono}px`,
    marginLeft: `${-mono / 2}px`,
    marginTop: `${-mono / 2}px`,
    borderWidth: `${Math.max(2, Math.round(size * 0.05))}px`,
  };

  return (
    <div
      className={classes}
      style={{ width: `${size}px`, height: `${size}px` }}
      onClick={() => setSquishing(true)}
      onAnimationEnd={(e) => {
        if (e.animationName === 'curio-squish') setSquishing(false);
      }}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title })}
    >
      <img src={curioBody} alt="" aria-hidden="true" />
      <div className="curio-eye" style={eyeStyle(EYE_LEFT_X)}>
        <div className="curio-pupil" ref={leftPupil} />
      </div>
      <div className="curio-eye" style={eyeStyle(EYE_RIGHT_X)}>
        <div className="curio-pupil" ref={rightPupil} />
      </div>
      <div className="curio-monocle" style={monocleStyle} aria-hidden="true" />
    </div>
  );
}
