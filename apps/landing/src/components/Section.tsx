import type { PropsWithChildren, ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionProps {
  id?: string;
  className?: string;
  /** Full-bleed subtle background band — used sparingly to break up an all-white page into rhythm. */
  tint?: boolean;
  children: ReactNode;
}

/** Shared section shell: centered measure, separation from whitespace alone, fades in on scroll. */
export function Section({ id, className, tint, children }: SectionProps) {
  return (
    <section id={id} className={`py-16 ${tint ? 'bg-bg-subtle' : ''} ${className ?? ''}`}>
      <div className="mx-auto max-w-[880px] px-5">
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}

export function Eyebrow({ children }: PropsWithChildren) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-fg-muted">
      {children}
    </p>
  );
}
