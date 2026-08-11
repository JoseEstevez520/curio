import { Reveal } from './Reveal';

/** Abstract stand-ins for catalog components — shapes, not screenshots of the real UI. */

function DefinitionSwatch() {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="h-2.5 w-2/3 rounded-full bg-fg-secondary" />
      <div className="mt-1 h-1.5 w-full rounded-full bg-border-strong" />
      <div className="h-1.5 w-5/6 rounded-full bg-border-strong" />
      <div className="mt-2 h-px w-full bg-border" />
      <div className="h-1.5 w-4/5 rounded-full bg-border-strong" />
    </div>
  );
}

function ComparisonSwatch() {
  return (
    <div className="flex h-full gap-3 p-4">
      {[0, 1].map((col) => (
        <div key={col} className="flex flex-1 flex-col gap-1.5">
          <div className="h-1.5 w-2/3 rounded-full bg-fg-secondary" />
          <div className="h-1.5 w-full rounded-full bg-border-strong" />
          <div className="h-1.5 w-4/5 rounded-full bg-border-strong" />
        </div>
      ))}
    </div>
  );
}

function ChartSwatch() {
  const heights = [30, 55, 40, 70, 100];
  return (
    <div className="flex h-full items-end gap-2 p-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-sm ${i === heights.length - 1 ? 'bg-accent' : 'bg-border-strong'}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function TimelineSwatch() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            className={`h-2 w-2 flex-none rounded-full ${i === 1 ? 'bg-accent' : 'bg-border-strong'}`}
          />
          <span
            className="h-1.5 flex-1 rounded-full bg-border-strong"
            style={{ maxWidth: `${70 - i * 15}%` }}
          />
        </div>
      ))}
    </div>
  );
}

const SWATCHES = [
  { label: 'Definition card', node: <DefinitionSwatch /> },
  { label: 'Comparison', node: <ComparisonSwatch /> },
  { label: 'Chart', node: <ChartSwatch /> },
  { label: 'Timeline', node: <TimelineSwatch /> },
];

export function CatalogSwatches() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {SWATCHES.map((s, i) => (
        <Reveal key={s.label} index={i}>
          <div className="flex flex-col">
            <div className="h-28 rounded-md border border-border bg-bg-subtle">{s.node}</div>
            <p className="mt-2 text-center text-xs text-fg-muted">{s.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
