import { Section } from './Section';
import { CatalogSwatches } from './CatalogSwatches';

export function GenUI() {
  return (
    <Section>
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-fg">Generative UI</h2>
      <p className="max-w-measure text-fg-secondary">
        The model doesn't write markup. It <strong className="text-fg">classifies and fills</strong>:
        picks a piece from a fixed, validated catalog and fills it with the data the term needs.
      </p>
      <div className="mt-6">
        <CatalogSwatches />
      </div>
    </Section>
  );
}
