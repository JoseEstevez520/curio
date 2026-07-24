import { useState } from 'react';
import { SvgLineChart, SvgDonut, type LinePoint, type Slice } from './charts/SvgCharts';
import { RechartsLine, RechartsDonut } from './charts/RechartsCharts';

/**
 * SPIKE (exp/openui) — side-by-side chart lab at `/?charts`. Same data, two implementations:
 * hand-rolled SVG + Framer Motion vs Recharts. "Repetir animación" remounts both (via key) so
 * you can watch the draw-on effect again and pick the approach.
 */

const LINE: LinePoint[] = [
  { label: 'Ene', value: 12 },
  { label: 'Feb', value: 19 },
  { label: 'Mar', value: 15 },
  { label: 'Abr', value: 27 },
  { label: 'May', value: 22 },
  { label: 'Jun', value: 34 },
];

const SLICES: Slice[] = [
  { label: 'Directo', value: 42 },
  { label: 'Búsqueda', value: 28 },
  { label: 'Social', value: 18 },
  { label: 'Email', value: 12 },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-3 text-xs font-medium uppercase tracking-[0.03em] text-fg-muted">
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ChartsLab() {
  const [runId, setRunId] = useState(0);

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-fg">Curio · Charts lab</span>
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          className="rounded-full bg-fg px-4 py-1.5 text-sm text-bg transition-opacity duration-fast hover:opacity-90"
        >
          Repetir animación
        </button>
      </header>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-fg">SVG propio + Framer Motion</h2>
          <Panel title="Línea (se traza)">
            <SvgLineChart key={`svg-line-${runId}`} data={LINE} />
          </Panel>
          <Panel title="Donut (arcos se dibujan)">
            <SvgDonut key={`svg-donut-${runId}`} slices={SLICES} />
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-fg">Recharts</h2>
          <Panel title="Área/línea (animación integrada)">
            <RechartsLine key={`rc-line-${runId}`} data={LINE} />
          </Panel>
          <Panel title="Donut (barrido integrado)">
            <RechartsDonut key={`rc-donut-${runId}`} slices={SLICES} />
          </Panel>
        </div>
      </div>

      <p className="mx-auto max-w-4xl px-4 pb-10 text-xs text-fg-muted">
        Misma data en ambos. Izquierda: SVG a mano con Framer Motion (trazado con pathLength,
        estilo 100% nuestro). Derecha: Recharts con su animación integrada. Pulsa “Repetir
        animación” para volver a verlo.
      </p>
    </div>
  );
}
