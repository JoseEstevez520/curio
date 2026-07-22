import { z } from 'zod';

/**
 * Something best understood as ordered events: a life, a war, a process, a history.
 * Dates are free-form strings ("1918", "c. 44 BC", "siglo XV") — never parsed.
 */
export const timelineData = z.object({
  title: z.string().max(120).optional(),
  events: z
    .array(
      z.object({
        date: z.string().max(40),
        label: z.string().max(120),
        detail: z.string().max(240).optional(),
      }),
    )
    .min(2)
    .max(8),
});

export type TimelineData = z.infer<typeof timelineData>;
