import Comparison from '@curio/core/catalog/components/Comparison';
import DefinitionCard from '@curio/core/catalog/components/DefinitionCard';

/**
 * The real catalog components (packages/core/src/catalog/components), fed real data — not an
 * approximation. Three frames, already unfolded: the glance, the panel it grows into, and one
 * level deeper. Read top to bottom, not clicked through.
 */

function OpenEntity({ children }: { children: string }) {
  return <span className="rounded-xs bg-accent-subtle px-0.5 text-accent">{children}</span>;
}

function PanelFrame({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg p-5">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3 text-xs text-fg-muted">
        <span>{breadcrumb ?? title}</span>
        <span>×</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-fg">{title}</h3>
      {children}
    </div>
  );
}

export function DepthShowcase() {
  return (
    <div className="grid gap-4">
      {/* The glance — a one-line gloss, nothing more. */}
      <div className="rounded-md border border-border bg-bg-subtle p-6">
        <p className="max-w-measure text-lg leading-relaxed text-fg">
          In 1543, Copernicus proposed a <OpenEntity>heliocentric</OpenEntity> model. The Sun,
          not Earth, sits at the center.
        </p>
        <div className="mt-4 w-72 rounded-md border border-border bg-bg p-3 text-sm text-fg-secondary">
          <strong className="text-fg">heliocentric</strong>: Sun-centered, proposed in 1543.
          <span className="mt-2 block text-xs font-medium text-accent">See more →</span>
        </div>
      </div>

      {/* "See more" grown into the panel, and one level deeper — the real Comparison and
          DefinitionCard components, side by side. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PanelFrame title="heliocentric">
          <p className="mb-3 text-sm leading-relaxed text-fg-secondary">
            Sun-centered. Replaces the older <OpenEntity>geocentric</OpenEntity> view, where
            Earth sat still at the middle.
          </p>
          <Comparison
            data={{
              columns: ['Heliocentric', 'Geocentric'],
              rows: [
                { label: 'Center', cells: ['Sun', 'Earth'] },
                { label: 'Proposed', cells: ['1543', '~150 CE'] },
                { label: 'Status', cells: ['Accepted model', 'Superseded'] },
              ],
            }}
          />
        </PanelFrame>

        <PanelFrame title="geocentric" breadcrumb="heliocentric › geocentric">
          <DefinitionCard
            data={{
              term: 'geocentric',
              partOfSpeech: 'adjective',
              definition:
                'Earth-centered: the model heliocentric replaced. Earth stayed still while the Sun and planets moved around it.',
              examples: ['The geocentric model held for over a thousand years before 1543.'],
              synonyms: ['Ptolemaic'],
            }}
          />
        </PanelFrame>
      </div>
    </div>
  );
}
