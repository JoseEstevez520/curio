import type { ComparisonData } from '../schemas';
import { SectionLabel, CatalogBlock, type CatalogComponentProps } from './kit';

/**
 * A borderless "X vs Y" comparison grid (2-4 columns, 1-8 rows): a header row of column
 * names, then a labeled row per attribute (docs/DESIGN.md §6 comparison-table recipe).
 * No outer box — the header gets a hairline underneath, body rows are separated by
 * hairlines, and whitespace does the rest. `cells` may arrive shorter than `columns`
 * (the model sometimes under-fills); missing cells render as an em dash rather than
 * breaking the layout.
 */
export default function Comparison({ data }: CatalogComponentProps<ComparisonData>) {
  return (
    <CatalogBlock>
      {data.title ? <SectionLabel>{data.title}</SectionLabel> : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-2 text-left text-xs font-semibold text-fg-muted" />
              {data.columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="px-2 py-2 text-left text-xs font-semibold text-fg-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr
                key={`${row.label}-${rowIndex}`}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-2 py-2 text-sm font-medium text-fg">{row.label}</td>
                {data.columns.map((column, colIndex) => (
                  <td key={`${column}-${colIndex}`} className="px-2 py-2 text-sm text-fg">
                    {row.cells[colIndex] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CatalogBlock>
  );
}
