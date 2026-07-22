import { z } from 'zod';

/**
 * An ordered how-to (a recipe, an algorithm, instructions) or a plain bulleted list.
 * `ordered` picks numbered steps vs. a simple list; each item is a short line with an
 * optional detail.
 */
export const stepsData = z.object({
  title: z.string().max(120).optional(),
  /** true → numbered steps; false/omitted → a bulleted list. */
  ordered: z.boolean().optional(),
  steps: z
    .array(
      z.object({
        text: z.string().max(160),
        detail: z.string().max(240).optional(),
      }),
    )
    .min(2)
    .max(10),
});

export type StepsData = z.infer<typeof stepsData>;
