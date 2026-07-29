import { motion } from 'framer-motion';
import type { DescriptionEntry } from '../app/store';

const EASE = [0.32, 0.72, 0, 1] as const;

/** Shared rendering of a description entry (loading / streaming / done / error). */
export default function DescriptionBody({ entry }: { entry?: DescriptionEntry }) {
  const loading = !entry || entry.status === 'loading';
  const hasText = !!entry?.text;

  if (entry?.status === 'error') {
    return (
      <p role="alert" className="text-fg-muted" style={{ animation: 'curio-fade-in 0.2s ease' }}>
        {entry.error}
      </p>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Text — occupies real space (relative) so the popover has its height from the
          first token. Enters with a soft fade + slide. */}
      {hasText ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="whitespace-pre-wrap"
          style={{ margin: 0 }}
        >
          {entry!.text}
          {loading && <span className="curio-caret" aria-hidden="true" />}
        </motion.p>
      ) : (
        /* Dots — absolute so they don't steal height; crossfade out as text arrives. */
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.6, y: -4 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="curio-dots"
          style={{ position: 'absolute', top: 0, left: 0 }}
          role="status"
          aria-label="Cargando descripción"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </motion.div>
      )}
    </div>
  );
}

/** Shared popover container styling (rounded, hairline, no shadow). */
export const POPOVER_CLASS =
  'curio-popover z-50 max-w-[320px] overflow-y-auto overscroll-contain rounded-xl border border-border bg-bg px-4 py-3 text-sm leading-normal text-fg-secondary';

/** Shared "Ver más" button — the same everywhere a gloss can be expanded. */
export function VerMasButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 text-xs font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
      style={{ animation: 'curio-fade-in 0.25s ease' }}
    >
      Ver más
    </button>
  );
}