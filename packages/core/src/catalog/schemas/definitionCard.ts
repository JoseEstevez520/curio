import { z } from 'zod';

/**
 * A term / word / concept that needs a concise meaning. The bread-and-butter card for a
 * reader clicking an unfamiliar word. Everything past `term` + `definition` is optional so
 * a small model can fill just what it's sure about.
 */
export const definitionCardData = z.object({
  term: z.string(),
  definition: z.string(),
  /** e.g. "noun", "verb", "sustantivo" — free-form, model's language. */
  partOfSpeech: z.string().optional(),
  examples: z.array(z.string()).max(5).optional(),
  synonyms: z.array(z.string()).max(8).optional(),
});

export type DefinitionCardData = z.infer<typeof definitionCardData>;
