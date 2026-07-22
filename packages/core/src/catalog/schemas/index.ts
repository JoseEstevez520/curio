import type { z } from 'zod';
import { plainTextData } from './plainText';
import { definitionCardData } from './definitionCard';
import { factTableData } from './factTable';
import { timelineData } from './timeline';
import { comparisonData } from './comparison';
import { stepsData } from './steps';
import { chartData } from './chart';
import { conceptDiagramData } from './conceptDiagram';
import type { CatalogType } from './envelope';

/**
 * Map from a catalog key to the Zod schema for that component's `data`. Used for two-stage
 * generation (stage 2 fills just the chosen component's schema) and for validating a
 * `data` payload in isolation.
 */
export const dataSchemas = {
  'plain-text': plainTextData,
  'definition-card': definitionCardData,
  'fact-table': factTableData,
  timeline: timelineData,
  comparison: comparisonData,
  steps: stepsData,
  chart: chartData,
  'concept-diagram': conceptDiagramData,
} satisfies Record<CatalogType, z.ZodType>;

export * from './envelope';
export * from './plainText';
export * from './definitionCard';
export * from './factTable';
export * from './timeline';
export * from './comparison';
export * from './steps';
export * from './chart';
export * from './conceptDiagram';
