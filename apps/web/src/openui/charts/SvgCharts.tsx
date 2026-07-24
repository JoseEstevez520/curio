import { motion } from 'framer-motion';

/**
 * SPIKE (exp/openui) — charts hand-rolled in SVG, animated with Framer Motion so they DRAW
 * THEMSELVES on entrance (line traces via `pathLength` 0→1; donut arcs draw in). Monochrome
 * chrome + the --chart-* palette for data. No chart dependency — full control of the style.
 */

const EASE = [0.32, 0.72, 0, 1] as const; // Curio's iOS decelerating curve

export interface LinePoint {
  label: string;
  value: number;
}

export function SvgLineChart({ data }: { data: LinePoint[] }) {
  const W = 320;
  const H = 150;
  const padX = 10;
  const padTop = 12;
  const padBottom = 22;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => padX + (i * (W - padX * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => padTop + (1 - (v - min) / span) * (H - padTop - padBottom);
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');
  const areaPath = `${path} L ${x(data.length - 1)} ${H - padBottom} L ${x(0)} ${H - padBottom} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>
      {/* baseline */}
      <line
        x1={padX}
        y1={H - padBottom}
        x2={W - padX}
        y2={H - padBottom}
        stroke="var(--color-border)"
        strokeWidth={1}
      />
      {/* area wash fades in under the line */}
      <motion.path
        d={areaPath}
        fill="var(--chart-1)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />
      {/* the line draws itself */}
      <motion.path
        d={path}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      {/* dots pop in as the line reaches them */}
      {data.map((d, i) => (
        <motion.circle
          key={i}
          cx={x(i)}
          cy={y(d.value)}
          r={3}
          fill="var(--color-bg)"
          stroke="var(--chart-1)"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.15 + (i / Math.max(1, data.length - 1)) * 1.0 }}
        />
      ))}
      {/* x labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 6}
          textAnchor="middle"
          fill="var(--color-fg-muted)"
          style={{ fontSize: 9 }}
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

export interface Slice {
  label: string;
  value: number;
}

export function SvgDonut({ slices }: { slices: Slice[] }) {
  const size = 150;
  const c = size / 2;
  const r = 52;
  const stroke = 18;
  const total = slices.reduce((s, x) => s + (x.value || 0), 0) || 1;

  // Build each slice as a stroked arc path so pathLength can "draw" it in.
  let acc = 0;
  const arcs = slices.map((s, i) => {
    const frac = (s.value || 0) / total;
    const a0 = acc * 2 * Math.PI - Math.PI / 2; // start at top
    acc += frac;
    const a1 = acc * 2 * Math.PI - Math.PI / 2;
    const sx = c + r * Math.cos(a0);
    const sy = c + r * Math.sin(a0);
    const ex = c + r * Math.cos(a1);
    const ey = c + r * Math.sin(a1);
    const large = frac > 0.5 ? 1 : 0;
    const d = `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
    return { d, color: `var(--chart-${(i % 5) + 1})`, frac, label: s.label, value: s.value };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
        {arcs.map((a, i) => (
          <motion.path
            key={i}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.25, ease: EASE }}
          />
        ))}
      </svg>
      <ul className="space-y-1 text-xs">
        {arcs.map((a, i) => (
          <li key={i} className="flex items-center gap-2 text-fg-secondary">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: a.color }}
            />
            <span>{a.label}</span>
            <span className="text-fg-muted">{Math.round(a.frac * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
