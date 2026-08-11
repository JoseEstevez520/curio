import { Section } from './Section';

const STEPS = ['copy', 'paste', 'search', 'come back'];

export function Problem() {
  return (
    <Section tint>
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-fg">The same old dance</h2>
      <p className="max-w-measure text-lg text-fg">
        Every word you don't know: you leave what you're reading, hunt it down elsewhere, find
        your way back. Since the 90s.
      </p>
      <div className="my-6 flex flex-wrap items-center justify-center gap-2">
        {STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className="rounded-full border border-border-strong px-4 py-1.5 text-sm text-fg-secondary">
              {step}
            </span>
            <span className="text-fg-faint">{i < STEPS.length - 1 ? '→' : '↻'}</span>
          </span>
        ))}
      </div>
      <p className="max-w-measure text-fg-secondary">
        Every hop loses your context. "Mercury" in a chemistry paragraph isn't "Mercury" next to
        "planet." A search box doesn't know which one you meant.
      </p>
    </Section>
  );
}
