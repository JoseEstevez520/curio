import { motion } from 'framer-motion';
import { useTheme } from './useTheme';

/**
 * Sun ↔ moon theme toggle with a morphing SVG (Argyle's technique, in Curio's motion language):
 * a mask circle slides in to "bite" the sun into a crescent moon, while the sunbeams retract and
 * fade. Monochrome (currentColor), hairline button, no shadows — same restraint as the rest.
 */

// [x1, y1, x2, y2] for the 8 sunbeams around a 24×24 viewBox.
const BEAMS: [number, number, number, number][] = [
  [12, 1, 12, 3],
  [12, 21, 12, 23],
  [4.22, 4.22, 5.64, 5.64],
  [18.36, 18.36, 19.78, 19.78],
  [1, 12, 3, 12],
  [21, 12, 23, 12],
  [4.22, 19.78, 5.64, 18.36],
  [18.36, 5.64, 19.78, 4.22],
];

const EASE = [0.32, 0.72, 0, 1] as const;

export default function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      onClick={toggle}
      className="grid h-7 w-7 place-items-center rounded-full text-fg-muted transition-colors duration-fast hover:text-fg"
    >
      <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
        <mask id="curio-moon-mask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          {/* Slides left (cx 24 → 15) to carve the crescent when dark. */}
          <motion.circle
            cy="10"
            r="6"
            fill="black"
            initial={false}
            animate={{ cx: dark ? 15 : 24 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </mask>
        {/* The disc: grows a touch as it becomes the moon. */}
        <motion.circle
          cx="12"
          cy="12"
          r="6"
          fill="currentColor"
          mask="url(#curio-moon-mask)"
          initial={false}
          animate={{ scale: dark ? 1.4 : 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />
        {/* Sunbeams: retract, spin a little and fade when dark. */}
        <motion.g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ scale: dark ? 0 : 1, opacity: dark ? 0 : 1, rotate: dark ? -25 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        >
          {BEAMS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </motion.g>
      </svg>
    </button>
  );
}
