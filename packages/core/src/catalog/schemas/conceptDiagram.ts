import { z } from 'zod';

/**
 * A concept shown as a small MAP: the term in the middle, connected out to a few related
 * ideas — the visual answer to "how does this connect to other things?". A radial layout
 * (center + spokes) keeps it robust for a small model and easy to render without overlap.
 */
export const conceptDiagramData = z.object({
  /** The central term. */
  center: z.string().max(48),
  /** The ideas it connects to (2–6), each with an optional short edge label ("produce", "usa"). */
  nodes: z
    .array(
      z.object({
        label: z.string().max(40),
        relation: z.string().max(32).optional(),
      }),
    )
    .min(2)
    .max(6),
});

export type ConceptDiagramData = z.infer<typeof conceptDiagramData>;
