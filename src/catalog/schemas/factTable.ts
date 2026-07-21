import { z } from 'zod';

/**
 * A tidy set of key/value facts about one thing (a planet's diameter, a person's dates,
 * a country's capital…). Two columns: a label and its value, a handful of rows.
 */
export const factTableData = z.object({
  title: z.string().max(120).optional(),
  facts: z
    .array(
      z.object({
        label: z.string().max(80),
        value: z.string().max(200),
      }),
    )
    .min(1)
    .max(8),
});

export type FactTableData = z.infer<typeof factTableData>;
