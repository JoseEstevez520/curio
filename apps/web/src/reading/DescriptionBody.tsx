import type { DescriptionEntry } from '../app/store';

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

  // Only dots while waiting for the first token — the popover stays small.
  if (!hasText) {
    return (
      <div className="curio-dots" role="status" aria-label="Cargando descripción" style={{ padding: '3px 0' }}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
    );
  }

  // Text has arrived: morph the popover container from dot-height to a generous cap,
  // then stream inside. overflow-hidden + max-height transition gives the "search box"
  // morph — no jitter because max-height goes to 200px on the FIRST token and stays there.
  return (
    <div
      style={{
        overflow: 'hidden',
        maxHeight: hasText ? 200 : 24,
        transition: 'max-height 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Dots — overlay, fade as the text settles */}
        <div
          className="curio-dots"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: loading ? 1 : 0,
            transition: 'opacity 0.22s ease',
            pointerEvents: loading ? 'auto' : 'none',
          }}
          aria-hidden={!loading}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
        {/* Text — streams inside the expanded container; fades in through the morph */}
        <p
          className="whitespace-pre-wrap"
          style={{
            opacity: loading ? 0.4 : 1,
            transition: 'opacity 0.3s ease 0.1s',
            margin: 0,
          }}
        >
          {entry!.text}
          {loading && <span className="curio-caret" aria-hidden="true" />}
        </p>
      </div>
    </div>
  );
}

/** Shared popover container styling (rounded, hairline, no shadow). */
export const POPOVER_CLASS =
  'curio-popover z-50 max-w-[320px] overflow-y-auto overflow-x-hidden overscroll-contain rounded-xl border border-border bg-bg px-4 py-3 text-sm leading-normal text-fg-secondary';

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