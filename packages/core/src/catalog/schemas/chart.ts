import { z } from 'zod';

/**
 * A small set of comparable QUANTITIES, shown as a bar chart (sizes, populations, durations,
 * percentages…). Single series only — Curio is monochrome, so there is no color-coded legend;
 * one value may be highlighted. 2–8 points keeps it legible in the modal.
 */
export const chartData = z.object({
  title: z.string().max(120).optional(),
  /** Optional unit shown with values, e.g. "km", "%", "millones". */
  unit: z.string().max(24).optional(),
  points: z
    .array(
      z.object({
        label: z.string().max(48),
        value: z.number(),
      }),
    )
    .min(2)
    .max(8),
  /** Index of the point to highlight with the accent (e.g. the clicked term). */
  highlight: z.number().int().min(0).optional(),
});

export type ChartData = z.infer<typeof chartData>;
