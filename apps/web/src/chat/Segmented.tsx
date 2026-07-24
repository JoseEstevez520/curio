import { motion } from 'framer-motion';
import { SEGMENT_SLIDE } from '@curio/core';

export interface SegmentedOption<T extends string | boolean> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string | boolean> {
  /** Unique id: the sliding indicator's layoutId, so controls don't cross-animate. */
  id: string;
  ariaLabel: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * A monochrome, hairline segmented control (DESIGN §4/§6). The active fill is a shared element:
 * on change it SLIDES to the chosen segment (SEGMENT_SLIDE, register 2 — "todo fluye a un lugar",
 * §9) rather than popping. Under prefers-reduced-motion the layout animation is skipped (the app's
 * MotionConfig honors it), so it simply snaps — exactly the reduced-motion contract. One control
 * for Texto/Gen UI, Chat/Leer and Local/Groq, so the whole header shares one motion language.
 */
export default function Segmented<T extends string | boolean>({
  id,
  ariaLabel,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors duration-fast ${
              active ? 'text-fg' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {active && (
              <motion.span
                layoutId={id}
                transition={SEGMENT_SLIDE}
                className="absolute inset-0 rounded-full bg-bg-inset"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
