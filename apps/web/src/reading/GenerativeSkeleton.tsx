/**
 * Placeholder shown in the modal while the generative component is being built. It hints at
 * a card's shape (a short label, then a few lines) so the reader sees structure arriving
 * rather than a spinner. Monochrome bars with a gentle shimmer — no color, no shadow.
 */
export default function GenerativeSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Generando descripción">
      <div className="curio-skeleton-bar" style={{ height: 10, width: '35%' }} />
      <div className="flex flex-col gap-2">
        <div className="curio-skeleton-bar" style={{ height: 14, width: '100%' }} />
        <div className="curio-skeleton-bar" style={{ height: 14, width: '86%' }} />
        <div className="curio-skeleton-bar" style={{ height: 14, width: '62%' }} />
      </div>
    </div>
  );
}
