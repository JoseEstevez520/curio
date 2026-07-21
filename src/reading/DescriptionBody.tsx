import type { DescriptionEntry } from '../app/store';

/** Shared rendering of a description entry (loading / streaming / done / error). */
export default function DescriptionBody({ entry }: { entry?: DescriptionEntry }) {
  const loading = !entry || entry.status === 'loading';

  if (entry?.status === 'error') {
    return <p className="text-fg-muted">{entry.error}</p>;
  }
  if (entry?.text) {
    return (
      <p className="whitespace-pre-wrap">
        {entry.text}
        {loading && <span className="curio-caret" aria-hidden="true" />}
      </p>
    );
  }
  return (
    <p className="text-fg-faint" aria-label="Loading">
      …
    </p>
  );
}

/** Shared popover container styling (rounded, hairline, no shadow). */
export const POPOVER_CLASS =
  'curio-popover z-50 max-w-[320px] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-bg px-4 py-3 text-sm leading-normal text-fg-secondary';
