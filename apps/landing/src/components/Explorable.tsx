import { Section } from './Section';
import { DepthShowcase } from './DepthShowcase';

export function Explorable() {
  return (
    <Section>
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-fg">
        Curiosity has no limits
      </h2>
      <p className="max-w-measure text-fg-secondary">
        A word opens its glance. "See more" grows it into a full panel, and any word inside
        that panel opens too. You can even chat with it: ask a follow-up in the panel and the
        answer comes back the same way, still explorable.
      </p>
      <p className="mt-3 max-w-measure text-sm text-fg-muted">
        Today, that's a chatbot and a browser extension. Same engine, two surfaces.
      </p>
      <div className="mt-6">
        <DepthShowcase />
      </div>
    </Section>
  );
}
