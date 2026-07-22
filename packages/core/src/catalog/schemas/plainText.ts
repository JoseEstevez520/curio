import { z } from 'zod';

/**
 * The safe default. Anything that doesn't fit a richer component falls back to this,
 * so the renderer can ALWAYS show something — plain prose in the reader's language.
 */
export const plainTextData = z.object({
  // Non-empty: a model reply of "" fails validation and coerces to the gloss fallback
  // instead of rendering an empty modal body.
  text: z.string().min(1),
});

export type PlainTextData = z.infer<typeof plainTextData>;
