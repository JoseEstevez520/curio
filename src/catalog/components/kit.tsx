import type { ReactNode } from 'react';

/**
 * Shared building blocks for catalog components, so every generated card speaks in one
 * visual voice (docs/DESIGN.md §6). Components render as clean blocks INSIDE the modal
 * body — hairlines and whitespace, never a box inside a box, never a shadow.
 */

/** Props every catalog component receives: its validated, typed `data` payload. */
export interface CatalogComponentProps<T> {
  data: T;
}

/**
 * The small, quiet section label above a component (a kicker). Uppercase-ish, muted, wide
 * tracking — the DESIGN §6 card-title recipe. Used so a reader can tell at a glance what
 * kind of answer they got ("Definición", "Cronología", …) without a heavy header.
 */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.03em] text-fg-muted">
      {children}
    </div>
  );
}

/** Vertical rhythm wrapper so every component has the same outer spacing in the modal. */
export function CatalogBlock({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}
