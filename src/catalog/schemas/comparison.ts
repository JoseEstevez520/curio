import { z } from 'zod';

/**
 * "X vs Y" or an attribute-by-attribute comparison. A borderless grid: a header row of
 * columns, then rows each with a label and one cell per column.
 */
export const comparisonData = z.object({
  title: z.string().max(120).optional(),
  columns: z.array(z.string().max(60)).min(2).max(4),
  rows: z
    .array(
      z.object({
        label: z.string().max(80),
        cells: z.array(z.string().max(160)).min(1).max(4),
      }),
    )
    .min(1)
    .max(8),
});

export type ComparisonData = z.infer<typeof comparisonData>;
