import type { DescriptionEntry } from '../app/store';

/** Shared rendering of a description entry (loading / streaming / done / error). */
export default function DescriptionBody({ entry }: { entry?: DescriptionEntry }) {
  const hasText = !!entry?.text;

  if (entry?.status === 'error') {
    return (
      <p role="alert" className="text-fg-muted" style={{ animation: 'curio-fade-in 0.2s ease' }}>
        {entry.error}
      </p>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: 24 }}>
      {/* Loading dots — fade out when text arrives */}
      <div
        className="curio-dots"
        role="status"
        aria-label="Cargando descripción"
        style={{
          opacity: hasText ? 0 : 1,
          position: hasText ? 'absolute' : 'relative',
          transition: 'opacity 0.25s ease',
          pointerEvents: hasText ? 'none' : 'auto',
        }}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
      {/* Text — fade in when it arrives */}
      {hasText && (
        <p
          className="whitespace-pre-wrap"
          style={{ animation: 'curio-fade-in 0.3s ease' }}
        >
          {entry!.text}
        </p>
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