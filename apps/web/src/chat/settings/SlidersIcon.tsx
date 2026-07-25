/** The monochrome sliders (settings) glyph — shared by both candidate triggers. */
export default function SlidersIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="21" x2="14" y1="6" y2="6" />
        <line x1="10" x2="3" y1="6" y2="6" />
        <line x1="21" x2="12" y1="18" y2="18" />
        <line x1="8" x2="3" y1="18" y2="18" />
        <line x1="14" x2="14" y1="4" y2="8" />
        <line x1="8" x2="8" y1="16" y2="20" />
      </g>
    </svg>
  );
}
