import type { FactTableData } from '../schemas';
import { SectionLabel, CatalogBlock, type CatalogComponentProps } from './kit';

/**
 * A tidy key/value table (1–8 rows): a label on the left, its value on the right.
 * No outer box — rows are separated by 1px hairlines, whitespace does the rest
 * (docs/DESIGN.md §6 comparison-table recipe). The last row drops its hairline.
 */
export default function FactTable({ data }: CatalogComponentProps<FactTableData>) {
  return (
    <CatalogBlock>
      {data.title ? <SectionLabel>{data.title}</SectionLabel> : null}
      <div>
        {data.facts.map((fact, index) => (
          <div
            key={`${fact.label}-${index}`}
            className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0"
          >
            <span className="text-sm font-medium text-fg-muted">{fact.label}</span>
            <span className="text-sm text-fg tabular-nums text-right">{fact.value}</span>
          </div>
        ))}
      </div>
    </CatalogBlock>
  );
}
