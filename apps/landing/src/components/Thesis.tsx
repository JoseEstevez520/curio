import Comparison from '@curio/core/catalog/components/Comparison';
import Steps from '@curio/core/catalog/components/Steps';
import { Section } from './Section';
import { Reveal } from './Reveal';

export function Thesis() {
  return (
    <Section tint className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-0 h-[380px] w-[380px] rounded-full bg-[#3b82f6] opacity-[0.09] blur-[100px]" />
      </div>
      <div className="relative">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-fg">What Curio could be</h2>
        <p className="max-w-measure text-lg text-fg">
          Reading tools split into two camps, and neither covers the other.
        </p>

        <Reveal>
          <div className="my-6 rounded-md border border-border bg-bg p-4">
            <Comparison
              data={{
                columns: ['Reactive', 'Archival'],
                rows: [
                  {
                    label: 'What it does',
                    cells: ['Answers what you ask', 'Saves what you point at'],
                  },
                  {
                    label: "What's missing",
                    cells: [
                      'Nothing kept once the tab closes',
                      "Doesn't help you understand it, or look on its own",
                    ],
                  },
                ],
              }}
            />
          </div>
        </Reveal>

        <p className="max-w-measure text-fg-secondary">
          Curio sits in the gap. Today, that means explaining in context, on click. The bet is
          bigger: notice what you're curious about across sessions, and turn it into a vault
          that keeps itself current, the way a research assistant would, reading alongside you
          instead of waiting to be asked.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Reveal index={0}>
            <div className="h-full rounded-md border border-border bg-bg p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
                Today
              </p>
              <Steps
                data={{
                  steps: [
                    { text: 'Curio Web', detail: 'The chat and reader, click-to-explain.' },
                    {
                      text: 'Browser extension',
                      detail: 'The same loop, on any page you read — already shipping.',
                    },
                  ],
                }}
              />
            </div>
          </Reveal>
          <Reveal index={1}>
            <div className="h-full rounded-md border border-border-strong bg-bg p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
                Next
              </p>
              <Steps
                data={{
                  steps: [
                    { text: 'Desktop app', detail: 'A local vault for what you read and ask.' },
                    {
                      text: 'Documents itself',
                      detail: 'Curiosity accumulates into a research vault, without extra work.',
                    },
                  ],
                }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
