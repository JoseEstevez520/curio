import { z } from 'zod';

/**
 * A tidy set of key/value facts about one thing (a planet's diameter, a person's dates,
 * a country's capital…). Two columns: a label and its value, a handful of rows.
 */
export const factTableData = z.object({
  title: z.string().optional(),
  facts: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .min(1)
    .max(12),
});

export type FactTableData = z.infer<typeof factTableData>;
