import { z } from 'zod';
import { plainTextData } from './plainText';
import { definitionCardData } from './definitionCard';
import { factTableData } from './factTable';
import { timelineData } from './timeline';
import { comparisonData } from './comparison';
import { stepsData } from './steps';
import { chartData } from './chart';
import { conceptDiagramData } from './conceptDiagram';

/**
 * The response envelope for a generated description. The model returns ONE of these: a
 * `type` that selects a component from the fixed catalog, a `confidence` it self-rates,
 * and a `data` payload matching that component's schema. The frontend validates the whole
 * thing with Zod before rendering, and falls back to `plain-text` on any failure.
 *
 * This is a discriminated union on `type`, so a parsed envelope narrows `data` to exactly
 * the right shape — the type system mirrors the runtime validation.
 */
export const envelope = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('plain-text'),
    confidence: z.number().min(0).max(1),
    data: plainTextData,
  }),
  z.object({
    type: z.literal('definition-card'),
    confidence: z.number().min(0).max(1),
    data: definitionCardData,
  }),
  z.object({
    type: z.literal('fact-table'),
    confidence: z.number().min(0).max(1),
    data: factTableData,
  }),
  z.object({
    type: z.literal('timeline'),
    confidence: z.number().min(0).max(1),
    data: timelineData,
  }),
  z.object({
    type: z.literal('comparison'),
    confidence: z.number().min(0).max(1),
    data: comparisonData,
  }),
  z.object({ type: z.literal('steps'), confidence: z.number().min(0).max(1), data: stepsData }),
  z.object({ type: z.literal('chart'), confidence: z.number().min(0).max(1), data: chartData }),
  z.object({
    type: z.literal('concept-diagram'),
    confidence: z.number().min(0).max(1),
    data: conceptDiagramData,
  }),
]);

export type Envelope = z.infer<typeof envelope>;

/** The set of valid catalog keys, derived from the envelope so it can never drift. */
export const CATALOG_TYPES = envelope.options.map((o) => o.shape.type.value) as [
  CatalogType,
  ...CatalogType[],
];

/** One catalog key, e.g. `'definition-card'`. */
export type CatalogType = Envelope['type'];

/** Narrow an envelope to a single type (handy for tests and the renderer). */
export type EnvelopeOf<T extends CatalogType> = Extract<Envelope, { type: T }>;
