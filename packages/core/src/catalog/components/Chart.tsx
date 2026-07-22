import type { ChartData } from '../schemas';
import { SectionLabel, CatalogBlock, type CatalogComponentProps } from './kit';

/**
 * A single-series horizontal bar chart for comparable quantities (sizes, populations,
 * durations, percentages…). Built with plain divs — no SVG, no axes, no gridlines.
 * DESIGN.md §6 "chart": monochrome ink (bg-fg) for every bar, with the one accent
 * (bg-accent) reserved for the highlighted point. No shadows, no gradients.
 */
export default function Chart({ data }: CatalogComponentProps<ChartData>) {
  const max = Math.max(...data.points.map((point) => point.value), 0);
  const formatter = new Intl.NumberFormat();

  return (
    <CatalogBlock>
      {data.title ? <SectionLabel>{data.title}</SectionLabel> : null}

      <ul className="flex flex-col space-y-2">
        {data.points.map((point, index) => {
          const safeValue = Math.max(point.value, 0);
          const pct = max > 0 ? (safeValue / max) * 100 : 0;
          const isHighlighted = data.highlight === index;
          const formattedValue = `${formatter.format(point.value)}${
            data.unit ? ` ${data.unit}` : ''
          }`;

          return (
            <li
              key={`${point.label}-${index}`}
              className="flex items-center gap-3"
              title={`${point.label}: ${formattedValue}`}
            >
              <span className="w-28 shrink-0 truncate text-sm text-fg-secondary">
                {point.label}
              </span>
              <span className="h-[8px] flex-1 rounded-full bg-bg-muted">
                <div
                  className={`h-[8px] rounded-full ${isHighlighted ? 'bg-accent' : 'bg-fg'}`}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-20 shrink-0 text-right text-sm tabular-nums text-fg">
                {formattedValue}
              </span>
            </li>
          );
        })}
      </ul>
    </CatalogBlock>
  );
}
