import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from 'recharts';
import type { LinePoint, Slice } from './SvgCharts';

/**
 * SPIKE (exp/openui) — the SAME charts via Recharts, with its built-in entrance animation ON
 * (line/area draws, pie sweeps). Colors wired to our --chart-* palette so we compare the LOOK
 * and the animation feel against the hand-rolled SVG version, not the styling.
 */

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function RechartsLine({ data }: { data: LinePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data} margin={{ top: 12, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="rc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
          tick={{ fill: 'var(--color-fg-muted)', fontSize: 9 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#rc-area)"
          dot={{ fill: 'var(--color-bg)', stroke: 'var(--chart-1)', strokeWidth: 2, r: 3 }}
          isAnimationActive
          animationDuration={1100}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RechartsDonut({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + (x.value || 0), 0) || 1;
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 150, height: 150, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            >
              {slices.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-xs">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-fg-secondary">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span>{s.label}</span>
            <span className="text-fg-muted">{Math.round(((s.value || 0) / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
