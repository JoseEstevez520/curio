import type { Envelope } from './schemas';
import PlainText from './components/PlainText';
import DefinitionCard from './components/DefinitionCard';
import FactTable from './components/FactTable';
import Timeline from './components/Timeline';
import Comparison from './components/Comparison';
import Steps from './components/Steps';
import Chart from './components/Chart';
import ConceptDiagram from './components/ConceptDiagram';

/**
 * Render a VALIDATED envelope as its catalog component. This is a `switch` on the
 * discriminated union, so in each branch TypeScript narrows `env.data` to exactly the
 * shape that component expects — the registry mapping is the type system itself, with no
 * `any` and no runtime lookup that could miss.
 *
 * The envelope must already be validated (use `coerceEnvelope` first), so this can never
 * be handed an unknown `type`; the `default` is a belt-and-braces fallback to plain text.
 */
export default function CatalogRenderer({ envelope }: { envelope: Envelope }) {
  switch (envelope.type) {
    case 'plain-text':
      return <PlainText data={envelope.data} />;
    case 'definition-card':
      return <DefinitionCard data={envelope.data} />;
    case 'fact-table':
      return <FactTable data={envelope.data} />;
    case 'timeline':
      return <Timeline data={envelope.data} />;
    case 'comparison':
      return <Comparison data={envelope.data} />;
    case 'steps':
      return <Steps data={envelope.data} />;
    case 'chart':
      return <Chart data={envelope.data} />;
    case 'concept-diagram':
      return <ConceptDiagram data={envelope.data} />;
    default:
      // Exhaustiveness guard: if a new catalog type is added without a branch here, this
      // line fails to compile. At runtime it degrades to nothing rather than crashing.
      return assertNever(envelope);
  }
}

function assertNever(value: never): null {
  void value;
  return null;
}
